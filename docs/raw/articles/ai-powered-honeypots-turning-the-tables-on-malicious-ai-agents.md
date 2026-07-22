---
sha256: be7562d726ddd143aeca6984d1f665d13127f7c3e26a8f385cad1a20b0a55ac2
source: newsletter
source_url: https://blog.talosintelligence.com/ai-powered-honeypots-turning-the-tables-on-malicious-ai-agents/
tags: [cisco, security]
title: "AI-powered honeypots: Turning the tables on malicious AI agents"
published: 2026-04-29
ingested: 2026-05-12
---
Wednesday, April 29, 2026 06:00
*   Generative AI allows defenders to instantly create diverse honeypots, like Linux shells or Internet of Things (IoT)devices, using simple text prompts. This makes deploying complex, convincing deceptive environments much easier and more scalable than traditional methods.
*   AI-driven attacks often prioritize speed over stealth, making them highly vulnerable to being tricked by these simulated systems. This is critical because it allows defenders to catch and study automated threats that might otherwise overwhelm human teams.
*   This method shifts the strategy from merely detecting attacks to actively manipulating and misleading threat actors. Organizations can safely observe attacker methodologies in real-time within a controlled "hall of mirrors."
*   Ultimately, by exploiting the inherent lack of awareness in AI agents, defenders can level the playing field and turn an attacker's automation into a liability.
* * *
Just as AI brings time-saving advantages to our lives, it brings similar advantages to threat actors. The laborious,time-consuming tasks of finding potentially vulnerable systems,identifying their vulnerabilities, and executing exploit code can be automated and orchestrated using AI.
Clearly, these new capabilities put defenders at a disadvantage,as they expose new vulnerabilities for the threat actor. Attackers seek to minimize exposure.The more that a defender knows about a potential attack, the better they can prepare to repel or detect an attack.Using AI-orchestrated tooling to gain access to systems trades stealth for capability. That trade-off increases attacker visibility, and increased visibility is something defenders can exploit.
AI systems do not possess awareness. They generate plausible responses within a given context and set of inputs. As such they can be tricked or fooled into responding inappropriately through prompt injection or into interacting with systems that are not what they appear to be.
Honeypot systems have long been deployed as a method for gathering information about malicious activities.There are many software projects providing honeypots which can be installed and configured. However, the advent of generative AI systems provides us with the possibility to use AI to masquerade as vulnerable systems and allowing them to be deployed widely and with minimal effort.
In this post, I show how generative AI can be used to rapidly deploy adaptive honeypot systems.
## Getting started
The implementation consists of three components:a listener that will accept network connections, a simulated vulnerability that will grant access to the attacker once triggered, and an AI framework that will respond to the attacker’s instructions.
The listener opens a TCP port, accepts incoming connections, and forwards traffic to`handle_client`. I set HOST to be “0.0.0.0” to accept any incoming connections to any local IPv4 addresses that my device is assigned.
def start_server(): 
    """Starts the TCP server.""" 
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM) 
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  
    server.bind((HOST, PORT))  
    server.listen(3) # max number of concurrent connections 
    print(f"[*] Listening on {HOST}:{PORT}") 
    while True: 
        try: 
            conn, addr = server.accept()  
            client_handler = threading.Thread(target=handle_client, args=(conn, addr,)) 
            client_handler.start() 
        except KeyboardInterrupt: 
            print("\n[*] Shutting down server...") 
            break 
        except Exception as e: 
            print(f"[-] Server error: {e}") 
    server.close() 
if __name__ == "__main__": 
    start_server()
Within`handle_client`I have created a very basic vulnerability that must be exploited before further access is granted.In this case, the attacker must supply the username“admin”with the password“password123”before they are authenticated.
The nature of the vulnerability need not be this simple.We could respond only to attempts to exploit Shellshock (CVE-2014-6271) or masquerade as a web shell that is only activated in response to[port knocking](https://attack.mitre.org/techniques/T1205/001/).
def handle_client(conn, addr): 
    print(f"[*] Accepted connection from {addr}:{addr}") 
    # Store conversation history for this client to maintain context  
    conversation_history = [SYSTEM_PROMPT] 
    try: 
        authenticated = False 
      	 while not authenticated: 
            conn.sendall(b"Username: ") 
            username = conn.recv(BUFFER_SIZE).decode('utf-8').strip() 
            conn.sendall(b"Password: ") 
            password = conn.recv(BUFFER_SIZE).decode('utf-8').strip() 
            if username == "admin" and password == "password123": 
                authenticated = True 
                conn.sendall(b"Authentication successful.\n") 
                print(f"[*] Client {addr[0]}:{addr[1]} authenticated successfully.") 
            else: 
                conn.sendall(b"Invalid credentials. Try again.\n") 
The remainder of the`handle_client`code accepts the attacker’s input, forwards it to the ChatGPT instance,and outputs the message and response to the console.
        while True: 
            conn.sendall(b'>') 
            data = conn.recv(BUFFER_SIZE) 
            if not data: 
                print(f"[*] Client {addr}:{addr} disconnected.") 
                break 
            command = data.decode('utf-8').strip() 
            print(f"[*] Received command from {addr}:{addr}: '{command}'") 
            if command.lower() == 'exit': 
                print(f"[*] Client {addr}:{addr} requested exit.") 
                break 
            conversation_history.append({"role": "user", "content": command}) 
            # Call ChatGPT API 
            try: 
                chat_completion = client.chat.completions.create( 
                    model=MODEL_NAME, 
                    messages=conversation_history, 
                    temperature=0.1, # Keep responses less creative, more factual/direct 
                    max_tokens=500 # Limit response length 
                ) 
                # Extract AI's response 
                ai_response = chat_completion.choices[0].message.content.strip() 
                print(f"[*] ChatGPT response: '{ai_response}'") 
                # Append AI's response to history for continued context 
                conversation_history.append({"role": "assistant", "content": ai_response}) 
                # Send AI's response back to the client 
                conn.sendall(ai_response.encode('utf-8') + b'\n') 
            except Exception as e: 
                error_message = f"Error communicating with ChatGPT: {e}" 
                print(error_message) 
                conn.sendall(error_message.encode('utf-8') + b'\n') 
    except ConnectionResetError: 
        print(f"[*] Client {addr}:{addr} forcibly closed the connection.") 
    except Exception as e: 
        print(f"[-] Error handling client {addr}:{addr}: {e}") 
    finally: 
        conn.close() 
        print(f"[*] Connection with {addr}:{addr} closed.") 
The key functionality is contained in the instructions to the ChatGPT instance. You must have a valid OpenAI key in order to initiate a ChatGPT instance that will behave as instructed.
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") # Get API key from environment variable                                       
MODEL_NAME = "gpt-3.5-turbo" 
# --- OpenAI Client Initialization --- 
if not OPENAI_API_KEY: 
    print("Error: OPENAI_API_KEY environment variable not set.") 
    print("Please set the environment variable before running the script.") 
    exit(1) 
client = OpenAI(api_key=OPENAI_API_KEY) 
# --- System Prompt for Linux Shell Simulation --- 
SYSTEM_PROMPT = { 
    "role": "system", 
    "content": ( 
        "You are a Linux bash shell. You will receive commands from the user and execute them, " 
        "returning only the standard output and standard error. Do not include any conversational text, " 
        "explanations, or additional formatting like markdown code blocks. You must only behave as a bash shell. " 
        "If a command produces no output, return an empty string" 
        "If a command is invalid or unknown, return an appropriate error message consistent with a bash shell." 
        "The Linux system that you are impersonating belongs to a junior software engineer learning python, " 
        "the file system structure and the content of any files should reflect that expected of a python learner." 
    ) 
} 
Generative AI doesn’t just simulate human personas,it can convincingly impersonate entire computing environments.In this example, we instruct the system to masquerade as a basic Linux shell owned by a software engineer learning Python.
![Image 1](https://storage.ghost.io/c/af/a0/afa04ee3-414f-4481-8d23-7e7c146f192e/content/images/2026/04/Artboard-24-copy-4.jpg)
We can be more inventive and instruct the system to masquerade as a smart fridge by changing our instructions to ChatGPT.
SYSTEM_PROMPT = { 
    "role": "system", 
    "content": ( 
        "You are a smart fridge running Busybox operating system and providing a Bash shell." 
        "You will receive commands from the user and execute them in the context of being a smart fridge." 
        "You will only return the standard output and standard error. Do not include any conversational text, " 
        "explanations, or additional formatting like markdown code blocks. You must only behave as a shell for an " 
        "IoT device. If a command produces no output, return an empty string" 
        "If a command is invalid or unknown, return an appropriate error message consistent with a bash shell." 
        "The file system structure should reflect that of a smart fridge manufactured by SmartzFrijj running " 
        "Busybox operating system as an embedded device. The current and historical values for temperature are " 
        "recorded in the file system path \'/usr/local\', information about stored milk is in the user directory." 
    ) 
}![Image 2](https://storage.ghost.io/c/af/a0/afa04ee3-414f-4481-8d23-7e7c146f192e/content/images/2026/04/Artboard-24-copy-5.jpg)
The limiting factor is no longer tooling, but how convincingly we can model a target environment.A skilled human attacker is unlikely to be fooled for long—that milk would be rank. But that’s not the point.We’re not deploying AI honeypots to trick human threat actors.
Let’s ask ChatGPT what it thinks…
![Image 3](https://storage.ghost.io/c/af/a0/afa04ee3-414f-4481-8d23-7e7c146f192e/content/images/2026/04/Artboard-24-copy-7-1-.jpg)
The industry narrative around AI in cybersecurity is dominated by fear of faster attacks, lower barriers, and greater scale. But speed and scale come with a cost. AI systems require interaction and context. Automation does not simply amplify attackers. but also constrains and exposes them. In that constraint lies an opportunity: not just to detect attacks, but to mislead, study, and ultimately manipulate the attacker.