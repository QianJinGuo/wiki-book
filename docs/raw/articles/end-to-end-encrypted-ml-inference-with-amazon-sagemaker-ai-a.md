---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe
ingested: 2026-06-09
feed_name: AWS China ML
source_published: 2026-06-08
sha256: 59b1776fdd408985f5393c9a1ea2c8bde25f7a3c831ba54340678ca1df4ad771
---

# End-to-end encrypted ML inference with Amazon SageMaker AI and FHE

Machine learning (ML) inference often requires processing sensitive data—medical records, proprietary business information, or personal communications. What if you could run ML inference in the cloud while hiding your data from the cloud itself? More specifically, what if you could enforce that your data stayed encrypted throughout the entire ML inference process? This post will show you how to use [Amazon SageMaker AI](<https://aws.amazon.com/sagemaker/ai/>) with fully homomorphic encryption (FHE) to perform ML inference. Using FHE, we present an approach to ML inference that’s designed to keep queries, responses, and intermediate values encrypted and unreadable by observers—including SageMaker AI itself.

FHE is a form of encryption that allows encrypted data to be processed in encrypted form without decryption. In the ML inference setting, you can use it to apply a model to an encrypted query without decryption, producing an encrypted prediction. Consider these scenarios where such a capability would provide value:

  * **Healthcare** : A health insurance company wants to provide doctors with an ML model that predicts medical procedure outcomes based on diagnostic data. Publishing the model in the cloud simplifies deployment, but doctors can’t expose patient medical information to third parties due to privacy regulations.
  * **Energy sector** : An oil and gas corporation uses ML to evaluate satellite photos of potential drill sites and select photos for further expert evaluation. They want to host the model in the cloud for cost savings but can’t expose photographs of politically sensitive locations to third parties.
  * **Telecommunications** : A telecom operator wants to process customer emails to detect spam and phishing. They need cloud-based ML for scalability, but data protection regulations require that customer messages remain encrypted at third parties.



This blog has previously discussed FHE for ML inference in the post [Enable fully homomorphic encryption with Amazon SageMaker endpoints for secure, real-time inferencing](<https://aws.amazon.com/blogs/machine-learning/enable-fully-homomorphic-encryption-with-amazon-sagemaker-endpoints-for-secure-real-time-inferencing/>), but this post goes a little further. That previous post showed how to implement FHE-based inference ‘from scratch’ by hand-crafting a linear-regression algorithm using a low-level library called [SEAL](<https://www.microsoft.com/en-us/research/project/microsoft-seal/>). Instead, this post shows a much more flexible and higher-level approach based on [concrete-ml](<https://docs.zama.org/concrete-ml>), a high-level library built specifically for FHE-based inference. It supports several common types of models ‘out of the box’ and is even API compatible with the well-known ML library scikit-learn.

In this post, you will learn how to:

  * Train a concrete-ml model in SageMaker AI using a custom container
  * Deploy that model to a SageMaker AI inference endpoint
  * Create a custom client for concrete-ml inference
  * Use that client to make queries to your inference endpoint



When finished you will have a system that uses concrete-ml in SageMaker AI designed to perform end-to-end encrypted ML inference.

## Solution overview

Using concrete-ml in SageMaker AI works as follows:

  1. The model owner prepares their data for training. Concrete-ml works well when all features have been normalized to the same scale, such as [-1, 1].
  2. The model owner uses this data to train an FHE-enabled version of their model. This model is designed to perform computations over encrypted data instead of plaintext.
  3. The model owner hosts this model in SageMaker AI.
  4. Clients encrypt their queries using the FHE scheme supported by the model.
  5. Clients send encrypted queries to the FHE-enabled model in the cloud.
  6. The model transforms the encrypted query into an encrypted prediction without decrypting values during the FHE computation.
  7. The model returns the encrypted response to the client, who decrypts it to retrieve the prediction.



This differs from, and complements, confidential computing environments like those provided by the Amazon Web Services (AWS) [Nitro System](<https://aws.amazon.com/ec2/nitro/>) in [Amazon Elastic Compute Cloud (Amazon EC2)](<https://aws.amazon.com/ec2/>). With AWS Nitro Enclaves, queries are decrypted and processed in plaintext within hardened, isolated environments that provide CPU and memory isolation. With FHE, queries remain encrypted throughout; security relies on mathematics rather than hardware or software.

## Prerequisites

To implement this solution, you need:

  * A local development environment with [Python](<https://www.python.org/>) 3.12 installed, the ability to install packages using [pip](<https://pip.pypa.io/en/stable/>), and [Docker](<https://www.docker.com/>) or other container-building software installed locally. In addition, these instructions will recommend that you work in [virtual environments](<https://virtualenv.pypa.io/en/latest/>), but this isn’t strictly necessary.
  * An AWS account, containing: 
    * Repositories in [Amazon Elastic Container Registry (Amazon ECR)](<https://aws.amazon.com/ecr/>) to hold the images for training and inference containers,
    * Locations in [Amazon Simple Storage Service (Amazon S3)](<https://aws.amazon.com/s3/>) to hold: 
      * The model
      * The training code (if you wish it to be stored in a separate bucket from the model)
      * Keys and ciphertexts



We suggest you follow the [security best practices for Amazon S3](<https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html>).

  * Roles in AWS Identity and Access Management (IAM) for 
    * The model creator
    * The inference endpoint creator
    * The inference endpoint itself
    * The clients



Find IAM policies for these roles, along with a worked example for the [MNIST corpus of handwritten digits,](<https://www.kaggle.com/datasets/hojjatk/mnist-dataset>) in the repository of [sample code.](<https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/tree/main>)

Before starting, note that at the time of writing, concrete-ml is available from Zama for [prototyping or non-commercial use](<https://community.zama.org/t/about-the-zama-open-source-licenses/223>) without requiring a paid license. However, you may require a [commercial license for commercial use.](<https://www.zama.org/post/open-source>)

## Training

### Build and deploy the training container

To build the training container:

  1. Assume the model-trainer role.
  2. Create a `[Dockerfile.training](<https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/blob/main/training/Dockerfile.training>)` file locally.
  3. Add the following content to `Dockerfile.training`: 
         
         FROM python:3.12
         RUN apt-get update && apt-get upgrade -y && apt-get clean
         RUN apt-get -y install --no-install-recommends cmake
         RUN pip install sagemaker_training==5.1.1 concrete-ml==1.9.0 concrete-python==2.10.0 torch==2.3.1

Verify that the version numbers match across the entire system. The `concrete-ml` library requires version parity across the entire system for Python, the `concrete-ml` package, and the `concrete-python` package.

  4. Build the container image: 
         
         docker build -f ./Dockerfile.training

  5. [Push the image to Amazon ECR](<https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html>): 
     1. Run the authentication command to log in Docker to your Amazon ECR registry:
    
    aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

     2. Tag the image with your repository name:
    
    docker tag <image-id> <account-id>.dkr.ecr.<region>.amazonaws.com/<repo-name>:latest

     3. Push the tagged image:
    
    docker push <account-id>.dkr.ecr.<region>.amazonaws.com/<repo-name>:latest




### Verify that the container is available
    
    
    aws ecr describe-images --repository-name <repo-name>

You should see JSON output containing your image with a non-empty `imageDigest` field and the `latest` tag.

### Train the model

To train the model, complete the following.

Note: in these steps, concrete-ml is no different from any other ML framework and the training container is no different from any other [custom training container](<https://docs.aws.amazon.com/sagemaker/latest/dg/adapt-training-container.html>). Note that training occurs over _plaintext_ data. That is, concrete-ml doesn’t require pre-processing of this data beyond normalization. But if additional pre-processing is necessary for regular training, it remains necessary here (and must occur before, or as part of, the training job).

#### Create the training script

  1. Create a file named `[training_script.py](<https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/blob/main/training/training_script.py>)`.
  2. Add the following template code to `training_script.py`: 
         
         import argparse
         import os
         import numpy
         from concrete.ml.sklearn import <Model class to train>
         from concrete.ml.deployment import FHEModelDev
         
         def do_training(model_dir, train):
             # Load your data from the train directory
             # Train your model instance, then save it
             # with the following line.
             FHEModelDev(model_dir, model).save()
         
         def model_fn(model_dir):
             # SageMaker AI requires this function exist but doesn't use it
             raise NotImplementedError
         
         if __name__ == '__main__':
             parser = argparse.ArgumentParser()
             parser.add_argument('--model-dir', type=str, default=os.environ['SM_MODEL_DIR'])
             parser.add_argument('--train', type=str, default=os.environ['SM_CHANNEL_TRAINING'])
             args = parser.parse_args()
             do_training(args.model_dir, args.train)

  3. Implement the data loading logic in the `do_training` function.
  4. Implement the model training logic in the `do_training` function.



#### Create a custom framework

For convenience, we recommend that you create a custom [framework](<https://docs.aws.amazon.com/sagemaker/latest/dg/frameworks.html>) to integrate your training container into SageMaker AI. To do so:

  1. Create a file named `[framework.py](<https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/blob/main/training/framework.py>).`
  2. Add the following content to `framework.py`: 
         
         from sagemaker.estimator import Framework
         
         class Concrete(Framework):
             def __init__(
                 self,
                 entry_point,
                 source_dir=None,
                 hyperparameters=None,
                 py_version="py312",
                 framework_version="1.9.0",
                 distributions=None,
                 **kwargs,
             ):
                 self.image_uri = <Training container location>
                 super(Concrete, self).__init__(
                     entry_point, source_dir, hyperparameters,
                     image_uri=self.image_uri,
                     **kwargs
                 )
                 self.framework_version = framework_version
                 self.py_version = py_version
         
             def training_image_uri(self, region=None):
                 return self.image_uri
         
             def create_model(
                 self,
                 model_server_workers=None,
                 role=None,
                 vpc_config_override=None,
                 entry_point=None,
                 source_dir=None,
                 dependencies=None,
                 image_name=None,
                 **kwargs,
             ):
                 return None

  3. Update the `image_uri` value with your Amazon ECR training container location.



#### Launch the training job

This section will show how to launch the training job with a python script, but it can also be done using the console or the AWS Command Line Interface (AWS CLI). (Note: training jobs incur charges based on instance type and duration.)

  1. Create a virtual environment for Python 3.12.
  2. Activate the virtual environment.
  3. Install the [following packages](<https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/blob/main/requirements_txt_files/requirements_training.txt>) using pip: 
         
         boto3==1.37.38
         sagemaker==2.243.2

  4. Create a file named `[start_training.py](<https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/blob/main/training/start_training.py>)`.
  5. Add the following content to `start_training.py`: 
         
         from sagemaker import session
         from framework import Concrete
         
         sagemaker_session = session.Session()
         
         concrete = Concrete(
             entry_point="training_script.py",
             instance_count=1,
             instance_type="ml.m5.xlarge",  # Use ml.m5.xlarge for small models, ml.m5.4xlarge for larger models
             role="arn:aws:iam::123456789012:role/SageMakerModelTrainerRole",  # Use the model-trainer role ARN from Prerequisites
             sagemaker_session=sagemaker_session,
             hyperparameters={},
             output_path="s3://my-model-bucket/concrete-ml/models/",  # Use the model bucket from Prerequisites
             code_location="s3://my-model-bucket/concrete-ml/scripts/",  # S3 path for training script storage
         )
         
         concrete.fit(inputs=<Amazon S3 location of the data>)

  6. Update the `instance_type`, `role`, `output_path`, `code_location`, and `inputs` values with your specific configuration.
  7. Execute this file: 
         
         python start_training.py

  8. Verify that the training completed successfully by checking the training job status: 
         
         aws sagemaker describe-training-job --training-job-name <job-name>

Look for `TrainingJobStatus: Completed`. Then verify that the output files exist:
         
         aws s3 ls s3://my-model-bucket/concrete-ml/models/

Confirm `server.zip` and `client.zip` are present.




After training completes, the training container saves two files to the model bucket: `server.zip` (used by the inference endpoint) and `client.zip` (used by clients to encrypt queries).

## Inference

### Build and deploy the inference container

FHE-based ML inference will be more complex than standard ML inference because of some new technical constraints:

  * Clients need model-specific information from `client.zip` to generate cryptographic keys.
  * FHE ciphertexts can exceed SageMaker AI query size limits, so the client and service need to communicate them outside of SageMaker AI API calls.
  * FHE evaluation might take longer than SageMaker AI timeouts, and so inference will use the SageMaker AI mechanisms for [asynchronous inference.](<https://docs.aws.amazon.com/sagemaker/latest/dg/async-inference.html>)
  * The endpoint needs an evaluation key (a type of public key) from the client to perform FHE evaluation.



To accommodate these new requirements and to streamline the user’s experience, we show you how to build a system in which

  * A custom client encrypts queries and attaches evaluation keys to them
  * A custom training endpoint retrieves client.zip when needed, and uses it to evaluate the FHE model
  * The same custom client decrypts predictions from the training endpoint
  * The client and endpoint communicate ciphertexts and keys to each other using Amazon S3



To deploy and use this system, complete the following sections.

#### Write your predictor

Create a file named `[predictor.py](<https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/blob/main/inference/endpoint/container_files/predictor.py>) `with the following content.
    
    
    from flask import Flask
    import flask
    import logging
    import json
    from concrete.ml.deployment import FHEModelServer
    from sagemaker.s3 import S3Uploader, S3Downloader
    
    # Load the model
    try:
        model = FHEModelServer("/opt/ml/model/")
    except Exception:
        logging.exception("Failed to initialize FHEModelServer")
        raise
    
    app = Flask(__name__)
    
    @app.route('/ping', methods=['GET'])
    def ping():
        return flask.Response(response='\n', status=200, mimetype='application/json')
    
    @app.route('/invocations', methods=['POST'])
    def transformation():
        try:
            input_json = flask.request.get_json()
            if not input_json or not isinstance(input_json, dict):
                return flask.Response(
                    response=json.dumps({"error": "Invalid JSON"}),
                    status=400,
                    mimetype="application/json",
                )
            required_keys = [
                "evaluation_keys_uri",
                "encrypted_query_uri",
            ]
            for key in required_keys:
                if key not in input_json:
                    return flask.Response(response=f'Missing required field: {key}',
                                          status=400)
                if (not isinstance(input_json[key], str)
                        or not input_json[key].startswith('s3://')):
                    return flask.Response(response=f'Invalid Amazon S3 URI for {key}', status=400)
            evaluation_keys_uri = input_json["evaluation_keys_uri"]
            encrypted_query_uri = input_json["encrypted_query_uri"]
            downloader = S3Downloader()
            try:
                evaluation_keys = downloader.read_bytes(evaluation_keys_uri)
                encrypted_query = downloader.read_bytes(encrypted_query_uri)
            except Exception as e:
                logging.error(f"Failed to download from S3: {e}")
                return flask.Response(response='Failed to retrieve data from Amazon S3',
                                      status=500)
            prediction = model.run(encrypted_query, evaluation_keys)
            return flask.Response(
                response=prediction, status=200, mimetype="application/octet-stream"
            )
        except KeyError as e:
            return flask.Response(
                response=json.dumps({"error": f"Missing key: {str(e)}"}),
                status=400,
                mimetype="application/json",
            )
        except Exception as e:
            return flask.Response(
                response=json.dumps({"error": "Internal server error"}),
                status=500,
                mimetype="application/json",
            )

This predictor expects the ‘query’ to contain three Amazon S3 locations: two for where to find the encrypted query and the associated evaluation key, and one for where to write the prediction. It downloads the query and key, evaluates the FHE model on them, and writes the prediction back to Amazon S3.

#### Package the predictor into a container

To package this predictor into a container:

  1. Assume the endpoint-creator role.
  2. Create a new directory for the container files.
  3. Copy `predictor.py` into the new directory.
  4. Obtain the required boilerplate files (`[nginx.conf](<https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/blob/main/inference/endpoint/container_files/nginx.conf>)`, `[serve](<https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/blob/main/inference/endpoint/container_files/serve>)`, and `[wsgi.py](<https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/blob/main/inference/endpoint/container_files/wsgi.py>)`) by downloading them from the sample repository or copying them from the SageMaker AI documentation for [custom inference containers](<https://docs.aws.amazon.com/sagemaker/latest/dg/adapt-inference-container.html>). (Note: the latter, increase the timeout value in `nginx.conf` to allow FHE evaluation to complete.)
  5. Create a [`Dockerfile.inference`](<https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/blob/main/inference/endpoint/Dockerfile.inference>) in that directory.
  6. Add the following content to the `Dockerfile.inference` file: 
         
         FROM python:3.12
         
         RUN apt-get -y update && apt-get install -y --no-install-recommends \
             nginx \
             ca-certificates \
             cmake \
             && rm -rf /var/lib/apt/lists/*
         
         RUN pip install flask gevent gunicorn sagemaker sagemaker_training==5.1.1 concrete-ml==1.9.0 concrete-python==2.10.0
         
         RUN rm -rf /root/.cache
         
         # Set environment variables
         ENV PYTHONUNBUFFERED=TRUE
         ENV PYTHONDONTWRITEBYTECODE=TRUE
         ENV PATH="/opt/program:${PATH}"
         
         COPY <directory holding container files>/ /opt/program
         RUN chmod +x /opt/program/serve
         
         WORKDIR /opt/program

  7. Build the container image: 
         
         docker build -f ./Dockerfile.inference

  8. [Push the image to Amazon ECR](<https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html>). 
     1. Run the authentication command to log in Docker to your Amazon ECR registry:
    
    aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

     2. Tag the image with your repository name:
    
    docker tag <image-id> <account-id>.dkr.ecr.<region>.amazonaws.com/<repo-name>:latest

     3. Push the tagged image:
    
    docker push <account-id>.dkr.ecr.<region>.amazonaws.com/<repo-name>:latest

     4. Verify the container is available:
    
    aws ecr describe-images --repository-name <repo-name>

You should see JSON output containing your image with a non-empty `imageDigest` field and the `latest` tag.




#### Deploy the inference endpoint

(Important: endpoints incur ongoing charges until deleted, and costs will vary based on instance type, training duration, and endpoint uptime. For detailed pricing information, see [Amazon SageMaker AI Pricing](<https://aws.amazon.com/sagemaker/pricing/>). Remember to delete the endpoint when finished to avoid unnecessary costs.) Continuing to use the endpoint-creator role:

  1. Create a virtual environment.
  2. Activate this virtual environment.
  3. Use pip to install the [following packages](<https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/blob/main/requirements_txt_files/requirements_endpoint.txt>): 
         
         boto3==1.37.38
         sagemaker==2.243.2

  4. Create a file [`start_inference_endpoint.py`](<https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/blob/main/inference/endpoint/start_inference_endpoint.py>) with the following content: 
         
         from sagemaker.session import Session
         from sagemaker.model import Model
         from sagemaker.predictor import Predictor
         from sagemaker.async_inference.async_inference_config import AsyncInferenceConfig
         
         sagemaker_session = Session()
         
         model = Model(
             image_uri="123456789012.dkr.ecr.us-east-1.amazonaws.com/concrete-inference:latest",  # Use the ECR URI from the previous build step
             model_data="s3://my-model-bucket/concrete-ml/models/model.tar.gz",  # Path where training job saved the model
             role="arn:aws:iam::123456789012:role/SageMakerEndpointRole",  # Use the endpoint role ARN from Prerequisites
             sagemaker_session=sagemaker_session,
             predictor_cls=Predictor,
         )
         
         async_config = AsyncInferenceConfig(
             max_concurrent_invocations_per_instance=1,
             output_path=<Amazon S3 location for a place to store result ciphertexts>,
             failure_path=<Amazon S3 location for a place to store inference failures>,
         )
         
         endpoint = model.deploy(
             initial_instance_count=1,  # Start with 1 instance for testing
             instance_type="ml.m5.xlarge",  # Minimum recommended for FHE; use ml.m5.24xlarge for better performance
             wait=True,
             endpoint_logging=True,
             async_inference_config=async_config,
         )
         
         print(f"Endpoint name: {endpoint.endpoint_name}")

  5. Execute the script: 
         
         python start_inference_endpoint.py

  6. Verify the endpoint is in service: 
         
         aws sagemaker describe-endpoint --endpoint-name <endpoint-name>

Wait until `EndpointStatus` shows `InService` before proceeding. This might take several minutes.




The script will print out the name of the endpoint. Record this name for the client.

### Create the client

The user shouldn’t need to know anything about FHE to use your system. Therefore, the client will hide all FHE details. Specifically, the client will:

  * Retrieve `client.zip` from Amazon S3.
  * Use `client.zip` to generate keys.
  * Encrypt the query with those keys.
  * Write the encrypted query and associated evaluation key to Amazon S3.
  * Send these locations to the inference endpoint and receive back the Amazon S3 location of the encrypted prediction.
  * Retrieve the encrypted prediction and decrypt it.



To create this client:

  1. Create a file named `[client.py](<https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/blob/main/inference/client/run_inference.py>)`.
  2. Add the following template code to `client.py`: 
         
         import tempfile
         import tarfile
         import os
         import json
         
         import sagemaker
         from sagemaker.s3 import S3Uploader, S3Downloader
         from sagemaker.base_deserializers import BytesDeserializer
         from sagemaker.base_serializers import JSONSerializer
         from sagemaker.predictor import Predictor
         from sagemaker.predictor_async import AsyncPredictor
         from sagemaker.async_inference.waiter_config import WaiterConfig
         from concrete.ml.deployment import FHEModelClient
         
         sagemaker_session = sagemaker.Session()
         predictor = AsyncPredictor(Predictor(
             <name of the endpoint created above>,
             serializer=JSONSerializer(),
             deserializer=BytesDeserializer(),
             sagemaker_session=sagemaker_session,
         ))
         
         model_location = <model Amazon S3 location>
         
         def get_query():
             # Code that returns the query to encrypt
             ...
         
         # Download and extract client configuration
         with tempfile.TemporaryDirectory() as config_dir_name:
             try:
                 S3Downloader().download(
                     model_location,
                     local_path=config_dir_name,
                     sagemaker_session=sagemaker_session,
                 )
                 tf = tarfile.open(os.path.join(config_dir_name,
                                                "model.tar.gz"),
                                   mode="r:gz")
                 tf.extract("client.zip", config_dir_name)
             except FileNotFoundError as e:
                 <handle exception>
             except tarfile.TarError as e:
                 <handle exception>
             except Exception as e:
                 <handle exception>
         
             with tempfile.TemporaryDirectory() as key_dir_name:
                 concrete_client = FHEModelClient(
                     config_dir_name,
                     key_dir=key_dir_name
                 )
         
                 # Generate and upload evaluation keys
                 eval_keys_location = <eval keys Amazon S3 location>
                 concrete_client.generate_private_and_evaluation_keys()
                 eval_keys = concrete_client.get_serialized_evaluation_keys()
                 uploader = S3Uploader()
                 uploader.upload_bytes(
                     eval_keys,
                     eval_keys_location,
                     sagemaker_session=sagemaker_session
                 )
         
                 # Encrypt and upload query
                 encrypted_query_location = <Amazon S3 location for encrypted query>
                 plaintext_query = get_query()
                 encrypted_query = concrete_client.quantize_encrypt_serialize(plaintext_query)
                 uploader.upload_bytes(
                     encrypted_query,
                     encrypted_query_location,
                     sagemaker_session=sagemaker_session
                 )
         
                 # Send request to endpoint
                 query = {
                     'evaluation_keys_uri': eval_keys_location,
                     'encrypted_query_uri': encrypted_query_location,
                 }
                 query_json = json.dumps(query)
         
                 try:
                     async_response = predictor.predict_async(
                         data=query_json,
                         input_path="<Amazon S3 location for the async query>",
                         initial_args={"ContentType": "application/json"},
                     )
         
                     # Wait for result from endpoint
                     encrypted_result = async_response.get_result(
                         waiter_config=WaiterConfig("<configuration values of your choice>")
                     )
         
                     prediction = concrete_client.deserialize_decrypt(encrypted_result)
                 except TimeoutError as e:
                     <handle exception>
                 except Exception as e:
                     <handle exception>

  3. Implement the `get_query()` function to retrieve your plaintext query.
  4. Update the placeholder values for Amazon S3 locations, endpoint name, and model location.
  5. Add exception handling code for the placeholder `<handle exception>` blocks to manage `TimeoutError`, `FileNotFoundError`, and `TarError` according to your application requirements.



(You might have noticed that the client and endpoint treat encrypted queries and responses differently. Clients send encrypted queries to endpoints by manually writing them to Amazon S3 and submitting the Amazon S3 location as the actual query. Endpoints submit encrypted results directly, allowing SageMaker AI to handle the write to / read from Amazon S3. Why the difference? The encrypted response is a single byte-string, which SageMaker AI can handle naturally. The client’s query, however, is a JSON structure that must contain the location of the evaluation keys. The encrypted query would need to be encoded (such as with [Base64](<https://en.wikipedia.org/wiki/Base64>)) to be embedded in the same JSON, which add unnecessary processing and network time. Hence, the sample code bypasses this encoding step by handling the encrypted queries itself.)

Then:

  1. Create a virtual environment.
  2. Activate the virtual environment.
  3. Install the [required packages](<https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/blob/main/requirements_txt_files/requirements_client.txt>): 
         
         boto3==1.37.38
         sagemaker==2.243.2
         concrete-ml==1.9.0
         concrete-python==2.10.0




Finally:

  1. Assume the client role.
  2. Execute this script:`python client.py`
  3. Verify that the FHE encryption is working correctly by comparing the prediction output to expected results.



## Clean up resources

To avoid incurring future charges, delete the resources that you created:

  1. Delete the inference endpoint through the SageMaker AI console or SDK.
  2. Verify that the endpoint was deleted: 
         
         aws sagemaker describe-endpoint --endpoint-name <endpoint_name>

This should return an error indicating that the endpoint doesn’t exist.

  3. Delete the endpoint configuration through the SageMaker AI console or SDK.
  4. Verify that the endpoint configuration has been deleted: 
         
         aws sagemaker list-endpoint-configs

This should show no matching endpoint configuration.

  5. Delete the SageMaker AI model through the SageMaker AI console or SDK.
  6. Verify that the model has been deleted: 
         
         aws sagemaker list-models

This should show no matching models.

  7. Delete the model artifacts, encrypted queries, encrypted responses, and evaluation keys from Amazon S3 through the Amazon S3 console or AWS CLI.
  8. Verify that Amazon S3 objects were deleted: 
         
         aws s3 ls s3://<bucket-name>/

This should show empty or no matching objects.

  9. Delete the container images from Amazon ECR through the Amazon ECR console or AWS CLI.
  10. Verify that the container images were deleted: 
         
         aws ecr describe-images --repository-name <repo-name>

This should show no matching images.




## Common issues

  * TimeoutError during inference: Increase WaiterConfig max_attempts or use larger instance type.
  * AccessDenied errors: Verify IAM roles have correct S3 and SageMaker AI permissions.
  * Container build failures: Verify Docker has sufficient memory (over 8 GB).
  * Server errors during inference: Verify version parity across concrete-ml packages.



## Performance and security considerations

FHE provides cryptographic protection but comes with performance tradeoffs. The overhead depends on the model, but you can typically expect slowdowns of up to 100,000X compared to plaintext inference. You can reduce this slowdown in a few ways. The first is to increase the number of vCPUs in the instance. Another is to use a standard ML technique called ‘quantization’ which reduces the numeric precision used in model inference. Because the running time of concrete-ml increases with numeric precision, quantization might assist performance here even more than it would in normal ML inference. Quantization can reduce model accuracy, which isn’t otherwise affected by the conversion to FHE. However, quantization in the [model code](<https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/blob/main/training/training_script.py>) reduced overhead to 2800X (67ms to 187s on a ml.m5.xlarge instance) with no observable loss in accuracy. By increasing the number of vCPUs, you can reduce that further to 500X (46s on a ml.m5.24xlarge instance).

This is still a significant slowdown for some applications. Because of this overhead, FHE isn’t yet suitable for interactive, latency-sensitive applications. However, it can be practical for asynchronous or batch processing workloads where privacy requirements outweigh latency concerns. For example, consider the use cases from the start of this post:

  * Providing doctors with an ML model that predicts medical procedure outcomes based on diagnostic data.
  * Evaluating satellite photos of potential oil/gas drill sites to select photos for further expert evaluation.
  * Detecting spam and phishing in email messages.



Each of these use cases can tolerate a few additional seconds of latency.

It’s [important that clients keep decrypted queries and predictions secret](<https://docs.zama.org/concrete-ml/explanations/security_and_correctness>), as a concrete-ml encryption and its plaintext decryption (when combined) could reveal information about the secret encryption key. Also, it’s important to know that this system doesn’t protect the secrecy of the model. The queries and responses will be encrypted and opaque to SageMaker AI, but concrete-ml doesn’t encrypt the model itself. The model might still be visible to Sagemaker AI. It also might be susceptible to ‘model stealing’ attacks by those who can see plaintext queries and responses. Lastly, concrete-ml doesn’t provide circuit privacy: it’s possible that information about the model can be revealed by cipertexts. However, customers can still protect model and ciphertexts with the standard security mechanisms that AWS provides for Amazon S3 and SageMaker AI. Remember: security is a [shared responsibility](<https://aws.amazon.com/compliance/shared-responsibility-model>) between AWS and each customer. In keeping with best practices, customers should:

  * Follow the principle of least privilege when creating IAM roles. Grant only the minimum permissions required for each role to perform its function. Review the sample IAM policies in the repository and adjust resource ARNs and actions to match your specific use case.
  * Enable Amazon S3 bucket encryption for values which are not FHE ciphertexts. This includes enabling default encryption on all Amazon S3 buckets that store models, data, and evaluation keys to protect data at rest.
  * Reduce Amazon S3 bucket permissions to the minimum required by the system.



## Conclusion

You can use FHE-based tools in SageMaker AI to perform inference on encrypted data designed to remain unreadable throughout the entire process. This approach can give you the benefits of SageMaker AI—agility, scale, and managed infrastructure—while helping you maintain cryptographic protection from query all the way through response.

To learn more about security and encryption in AWS, refer to the following resources:

  * [What cryptographic services does AWS provide to customers?](<https://aws.amazon.com/what-is/cryptography/#what-cryptographic-services-does-aws-provide-to-customers--1x0wovp>)
  * [AWS Crypto Tools Documentation](<https://docs.aws.amazon.com/aws-crypto-tools/>)
  * [Cryptographic computing at AWS](<https://aws.amazon.com/security/cryptographic-computing/>)
  * [An overview of fully homomorphic encryption](<https://homomorphicencryption.org/introduction/>)
  * [Enable fully homomorphic encryption with Amazon SageMaker endpoints for secure, real-time inferencing](<https://aws.amazon.com/blogs/machine-learning/enable-fully-homomorphic-encryption-with-amazon-sagemaker-endpoints-for-secure-real-time-inferencing/>)
  * [Security in Amazon S3](<https://docs.aws.amazon.com/AmazonS3/latest/userguide/security.html>)
  * [Security in Amazon Elastic Container Service](<https://docs.aws.amazon.com/AmazonECS/latest/developerguide/security.html>)
  * [Configure security in Amazon SageMaker AI](<https://docs.aws.amazon.com/sagemaker/latest/dg/security.html>)
  * [Security best practices in IAM](<https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html>)



If you have questions or comments, contact us at aws-crypto-compute@amazon.com.

* * *

## About the authors

### Jonathan Herzog

[Jonathan](<https://www.linkedin.com/in/jonathanherzog>) is a cryptographer in the AWS Cryptography group. Before coming to AWS, he was a security architect at Akamai, an Associate Professor of Computer Science, and a cryptographer at various Federally Funded Research and Development Centers. He previously worked on the [Cryptographic Computing for Clean Rooms (C3R) project](<https://aws.amazon.com/blogs/security/share-and-query-encrypted-data-in-aws-clean-rooms/>) and is currently working on developing new cryptographic-computing systems for customers.

### Ruben Merz

[Ruben](<https://www.linkedin.com/in/rubenmerz>) is a Principal Solutions Architect at AWS. With a background in distributed systems and networking, his work with customers at AWS focuses on digital sovereignty, AI, and networking.
