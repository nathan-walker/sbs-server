title: Administering your OS X Server
published: 1411358400000
author: nathan
type: Post
slug: administering-your-os-x-server
tags: linux
mac
mac-server
os-x-server
screen-sharing
server
vnc
windows



Now that you have your server set up, you're going to need to control it. Fortunately, OS X Server can be controlled in a number of ways, both using the server or using another computer.

<h2>Using Server.app on Your Server</h2>

The first way that you can control your server is simply by using the Server app that you installed already. Simply launch Server, select "This Mac" from the list and log in with an administrator account. Now, you have access to the full array of server controls for all of the built-in services.

<h2>Using Server.app on Another Machine</h2>

The next way that you can control your server is by using the same Server app on another machine. Simply install OS X Server from the App Store on another machine and launch the Server app. Instead of pressing "Continue" to set up that machine as a server, go the Manage menu and press "Connect to Server". Then, select the server you want to connect to if it is visible or choose "Other Mac" and enter the remote machine's IP address and administrator login information.

To find your Mac's IP address, go to System Preferences -&gt; Network and select the interface that you are using for network access (probably Ethernet or Wi-Fi). The System Preferences window will display the IP address for that Mac. If you haven't set up a static IP address in the server setup process, you may wish to do so. Now, you can control your server just as you would if you were actually using the server hardware.

I would like to mention one thing regarding Apple's Mac App Store licensing here. The license for OS X Server allows you to install it on all of your personal Macs, if you are using server for personal, non-commercial uses. If you are a business user, then you have the right to install the software on one machine with many users or many machines with one common user. If you want to use Server beyond this, you'll need to purchase multiple copies of OS X Server.

<h2>Screen Sharing</h2>

The third way that you can control your server is by remotely accessing the server using a solution called Screen Sharing. This system allows you to view the screen of the server as if you were directly in front of it, but you can use any computer to manage your server (even a PC or Linux machine).

In order to enable Screen Sharing, go to System Preferences, and open the Sharing pane. Now, check the box next to "Screen Sharing". If you want to access your server from a PC or Linux machine, click on the "Computer Settings..." button and check "VNC viewers may control screen with password:" and enter a password in the box to the right. Then, press "OK". Enter your administrator password if necessary.

<h3>Accessing from a Mac</h3>

If you are using a Mac, your server should appear in the Finder Sidebar under the "Shared" section. After you select it, you should be able to press a "Share Screen" button in the Finder window. Then, enter your login information.

If you don't see your server in the Finder, simply type `vnc://YOUR_SERVER_IP` into Go -&gt; Connect to Server using the Finder. Then, you should be able to enter your login information. If you are unsure of your server's IP address, use the instructions under "Using Server.app on Another Machine".

Now that you are viewing the screen of your server, you can just open the Server app just as you would if you were physically using your server.

<h3>Accessing from a PC</h3>

As Apple's Screen Sharing is compatible with the open VNC standard, you can access your server from a PC. However, Windows does not include a VNC client so you will need to download one. I recommend [TightVNC](http://tightvnc.com). Install the software and then open the TightVNC Viewer. Enter the IP address of your server, and you should get the login screen for your server. Login as an administrator and you should get the OS X desktop.

Now that you are viewing the screen of your server, you can just open the Server app just as you would if you were physically using your server.

<h3>Accessing from a Linux machine</h3>

Accessing your Mac from a Linux machine is very similar to the process on Windows. The application that I use is GTK VNC Viewer on Ubuntu. You should be able to grab this using your package manager. Just install the application and input your server's IP address, your admin user name, and your admin password. Then, press the Connect button, and you will be viewing your Mac server.

Now that you are viewing the screen of your server, you can just open the Server app just as you would if you were physically using your server.