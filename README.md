# birdycam
A bird cam running on a raspberry Pi

#setup
````sudo raspi-config````
Select Enable Camera press Enter and then Finish

Warning: The installer will replace various files, so backup all your data.

### Step 1: Install Raspbian on your RPi
### Step 2: Attach camera to RPi and enable camera support (http://www.raspberrypi.org/camera)
### Step 3: Update your RPi with the following commands:

````
sudo apt-get update
sudo apt-get dist-upgrade
````

Occasionally if camera core software updates have been done then a ````sudo rpi-update```` may be used to benefit from these before they become available as standard.

### Step 4: Clone Jesse From GitHub
Clone the code from github and enable and run the install script with the following commands:

````
git clone https://github.com/silvanmelchior/RPi_Cam_Web_Interface.git
cd RPi_Cam_Web_Interface
chmod u+x *.sh
./install.sh
````

### Step 5: Forward Port
At this point you'll have the cam software running. The router which is used to connect the camera to the internet needs a port forward set up so that it exposes the port the cam web interface runs on, leaving the image feed available at your public IP address. If you left the ports as default settings, the port to forward is 80.

### Step 6: Git Clone
Clone the repo for the birdycam server onto your http server machine, then use npm to get the dependencies

````git clone git@github.com:thebelin/birdycam.git````
````npm i````

### Step 7: Update Streaming Configuration
You will then need to change the cam source information in the index.js file to point at your camera's external IP address. This way, it tunnels into the camera and makes that available on the streaming server.

### Step 8: Install Forever and start server
Forever.js is a utility which will keep your server running even if it crashes on a regular basis

````npm i -g forever````
````forever start index.js````

### Step 9: Forward your port
Web servers are supposed to run on port 80. You won't have access to that port unless you're logged in as root. Fortunately, there's NAT mapping to the rescue. Start your server on port 8000 and then use a prerouting entry to redirect your traffic:

````sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8000````
