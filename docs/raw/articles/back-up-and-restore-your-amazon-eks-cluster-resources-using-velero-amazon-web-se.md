---
title: Back up and restore your Amazon EKS cluster resources using Velero | Amazon Web Services
type: raw
source: newsletter
source_url: https://aws.amazon.com/blogs/containers/back-up-and-restore-your-amazon-eks-cluster-resources-using-velero/
tags: [aws-china-blog, agentic-ai, context-engineering]
ingested: 2026-05-20
sha256: ee01b2327662c1b2
---

apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: auto-ebs-sc
provisioner: ebs.csi.eks.amazonaws.com
volumeBindingMode: WaitForFirstConsumer
parameters:
  type: gp3
  encrypted: "true"
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: auto-ebs-claim
  namespace: myprimary
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: auto-ebs-sc
  resources:
    requests:
      storage: 8Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-stateful-app
  namespace: myprimary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: demo-stateful-app
  template:
    metadata:
      labels:
        app: demo-stateful-app
    spec:
      terminationGracePeriodSeconds: 0
      nodeSelector:
        eks.amazonaws.com/compute-type: auto
      containers:
      - name: bash
        image: public.ecr.aws/docker/library/bash:4.4
        command: ["/usr/local/bin/bash"]
        args: ["-c", "while true; do echo \"Message from \$POD_NAMESPACE - \$(date -u)\" >> /data/out.txt; sleep 15; done"]
        env:
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        resources:
          requests:
            cpu: "100m"
        volumeMounts:
        - name: persistent-storage
          mountPath: /data
      volumes:
      - name: persistent-storage
        persistentVolumeClaim:
          claimName: auto-ebs-claim
EOF
kubectl apply -f deployment-demo-app.yaml
```
PHP
Verify the pod is running. Node provisioning by Amazon EKS might take a couple of minutes.
```
kubectl get po -n myprimary
kubectl exec -n myprimary "$(kubectl get pods -n myprimary -l app=demo-stateful-app -o=jsonpath='{.items[0].metadata.name}')" -- cat /data/out.txt
```
CSS
Define a Velero Backup custom resource for the myprimary namespace. This YAML scopes the backup to specific resource types and triggers Amazon EBS snapshots for persistent volumes. See the [Velero Backup API documentation](https://velero.io/docs/main/api-types/backup/) for filtering options.
```
cat > myprimary-backup.yaml <<EOF
apiVersion: velero.io/v1
kind: Backup
metadata:
  name: backup-myprimary
  namespace: velero
spec:
  includedNamespaces: [myprimary]
  includedResources: [deployments,pods,persistentvolumeclaims,persistentvolumes,services,configmaps,secrets]
  snapshotVolumes: true
  defaultVolumesToFsBackup: false
  ttl: 720h0m0s
EOF
kubectl apply -f myprimary-backup.yaml
```
Code
After a couple of minutes, confirm the backup completed.
```
kubectl describe backup backup-myprimary -n velero
# Look for Phase: Completed
```
Code
## Restore an application
Restore the backup to a new namespace called myrestore. Velero’s namespace mapping redirects resources from myprimary to myrestore. Apply the Restore custom resource. This YAML specifies which backup to restore and how to map namespaces.
```
cat > myprimary-restore.yaml <<EOF
apiVersion: velero.io/v1
kind: Restore
metadata:
  name: myprimary-restore
  namespace: velero
spec:
  backupName: backup-myprimary
  namespaceMapping:
    myprimary: myrestore
  preserveNodePorts: true
  restorePVs: true
EOF
kubectl apply -f myprimary-restore.yaml
```
Code
Confirm the restore completed.
```
kubectl describe restore myprimary-restore -n velero
```
Code
Check the data file on the restored pod.
`kubectl exec -n myrestore "$(kubectl get pods -n myrestore -l app=demo-stateful-app -o=jsonpath='{.items[0].metadata.name}')" -- cat /data/out.txt`
CSS
The output shows messages from myprimary, confirming that Velero restored the persistent volume data from the Amazon EBS snapshot.
## Clean up
Remove the resources you provisioned to stop incurring charges for Amazon S3 storage, Amazon EBS snapshots, and Amazon EKS compute.
```
kubectl delete -f deployment-demo-app.yaml
kubectl delete namespace myrestore
helm uninstall velero -n velero
kubectl delete namespace velero
kubectl delete clusterrolebinding velero-restricted-binding
kubectl delete clusterrole velero-restricted
aws eks delete-addon --cluster-name ${CLUSTER_NAME} --addon-name snapshot-controller --region ${AWS_REGION}
aws s3 rb s3://$BUCKET_NAME --force
aws iam detach-role-policy --role-name VeleroBackupRole --policy-arn ${POLICY_ARN}
aws iam delete-role --role-name VeleroBackupRole
aws iam delete-policy --policy-arn ${POLICY_ARN}
```
TypeScript
Also check the [Amazon EBS console](https://console.aws.amazon.com/ec2/home#Snapshots) for remaining snapshots or volumes and delete them manually.
## Conclusion
You configured Velero on Amazon EKS to back up and restore Kubernetes cluster resources and persistent volume data with least-privilege AWS IAM roles and a scoped ClusterRole. To build on what you’ve learned, try these next steps:
*   Automate daily backups of your production namespaces with a [Velero Schedule resource](https://velero.io/docs/main/api-types/schedule/).
*   Test a cross-cluster restore to a second [Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/) cluster in a different Region using the [Velero disaster recovery documentation](https://velero.io/docs/main/disaster-case/).
*   Evaluate [AWS Backup for Amazon EKS](https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html) and compare centralized scheduling against namespace-level granularity and cross-cluster portability.
*   Harden your cluster security by reviewing the [Amazon EKS security best practices guide](https://docs.aws.amazon.com/eks/latest/best-practices/security.html).
Share your experiences in the [AWS containers community forum](https://repost.aws/tags/TA4IvCeWI1SkQNg5sUWgO9gA/amazon-elastic-kubernetes-service).
For reference, see the following resources:
*   [Velero documentation](https://velero.io/docs/main/)
*   [Amazon EKS User Guide](https://docs.aws.amazon.com/eks/latest/userguide/)
*   [Amazon EKS Pod Identity](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html)
*   [Amazon EBS CSI driver](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html)
*   [IAM best practices for Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/security-iam.html)
*   [Amazon S3 bucket policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html)
*   [AWS Backup Developer Guide](https://docs.aws.amazon.com/aws-backup/latest/devguide/)
* * *
## About the authors