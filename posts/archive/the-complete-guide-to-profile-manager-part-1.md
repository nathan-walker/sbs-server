title: The Complete Guide to Profile Manager (Part 1)
published: 1349582400000
author: nathan
type: Post
slug: the-complete-guide-to-profile-manager-part-1
tags: ios
mac
mac-server
mountain-lion
os-x
os-x-server
profile-manager
server



In order to have easy, complete control over your devices and user accounts, OS X Server includes Profile Manager, a tool for managing Macs, iOS devices, and users on both platforms.

Profile Manager will work with iOS devices running iOS 3 or later (device enrollment is only supported on iOS 4.1 or later) and Macs running OS X Lion (10.7) or later.

<h2>Managing Devices</h2>

In order to manage devices, you must first enable Profile Manager on your server. Open Server.app and enable the Profile Manager service. The Web service is also required to run the Profile Manager server.

Now, you’ll need to use the Profile Manager web interface to manage your users and devices. The Profile Manager web interface can be accessed in two different ways. In the Profile Manager section of Server.app, you can click “Open Profile Manager” in the lower right of the window. Alternatively, you can visit https://your-server-address/profilemanager. If necessary, use a server administrator account to login to Profile Manager.<!--more-->

Now, you’ll see the Profile Manager interface, which consists of three columns. In the left column is a list of Profile Manager sections. In this column are two primary sections: Library and Activity. In the Library section, you will find all four categories: Devices for managed devices, Device Groups for groups of managed devices, Users for all of your server’s users, and Groups for all of your managed groups. You can use these categories to deploy profiles, sets of configuration information, to users and devices.

<h3>Devices</h3>

One of the basic categories that you can deploy profiles to is devices. This category shows all of your managed devices at once, and you can deploy profiles to them individually from here. Devices cannot be added directly to Profile Manager; they must be enrolled first. Device enrollment will be covered shortly. However, before a device is enrolled, you can add placeholders for expected devices.

While in the Devices category, click the plus button in the center column. Next, press “Add Placeholder”. You can give an expected device a name for management purposes here. You must also give an identification number (serial number, UDID, IMEI, or MEID), so Profile Manager can identify the device when it is enrolled.

Placeholders can also be created in bulk. Just go to the same plus icon in the center column and press “Import Placeholders”. Next, you need to import a CSV file containing device information. This CSV file (which can be exported from Excel, Numbers, or LibreOffice Calc) must be formatted as such:
<ul>
	<li>The following header rows:
<ul>
	<li>DeviceName</li>
	<li>SerialNumber</li>
	<li>UDID</li>
	<li>IMEI</li>
	<li>MEID</li>
</ul>
</li>
	<li>A Windows-formatted CSV (not really sure why)
<ul>
	<li>Check your spreadsheet application for a Windows CSV export option</li>
	<li>If there isn’t a Windows CSV option, follow these steps:
<ul>
	<li>Export as a regular CSV file</li>
	<li>Open the Terminal. You can find this in Applications -&gt; Utilities -&gt; Terminal.</li>
	<li>Type in <code>nano FILEPATH</code> (if you don’t want to type the file path, you can just drag and drop the file into the terminal after typing <code>nano</code> to add the file path). Press return.</li>
	<li>Press Control+O. Then, press Escape+D. Press return. Finally, press Control-X.</li>
	<li>Now, your CSV file will be formatted in Windows format.</li>
</ul>
</li>
</ul>
</li>
</ul>

After importing your CSV file, you will get an option to create a Device Group based on this import. If you ever plan on configuring these devices as a group, you’ll want to do this. There is no reason not to do this to be safe, so I recommend it.

<h3>Device Groups</h3>

Device Groups are simply a way to group a number of devices together for management. As previously mentioned, these can be automatically created when importing device placeholders. You can also create device groups manually.

To create a device group, go to the Device Groups category and click on the plus sign in the center column. Type in a name for your device group. Click on the plus sign in the right column and click “Add Devices” or “Add Device Groups”. You can now add devices individually or filter them by name and add them to your group.

<h3>Users and Groups</h3>

Users and Groups in Profile Manager are pulled from the pre-established users and groups in Server.app. You can manage them there.

<h3>Creating a Profile</h3>

A profile is a package of settings used to configure a device or user’s account. These profiles can apply to a device, device group, user, or user group. In order to add a profile:
<ul>
	<li>Select the device, device group, user, or group that you wish to configure.</li>
	<li>Make sure that you are on the Profile tab.</li>
	<li>Under “Settings for NAME”, select “Edit”.</li>
	<li>From here, you can edit your profile.</li>
</ul>

How to configure a profile will be covered shortly, but first, we’ll discuss how to apply a profile to your devices.

<h3>Deploying a Profile</h3>

Now that you have a profile created, you’ll want to send it to your devices, so the settings can take effect. You can do this by either manually installing all profiles or by having profiles automatically pushed to devices.

<h4>Manual Profile Install</h4>

The first way that you can deploy profiles is by having them manually installed on each device and/or user account. In order to do this, just download each profile using the “Download” button next to “Edit” and send it (via email or some other means) to whom you want to install it. Then, the user can simply open the profile and press “Install”. However, this method is inefficient as you will need to reinstall the profile every time that you wish to change or update the profile.

<h4>Automatic Push</h4>

The best way to install profiles is through Automatic Push to devices, which only requires a one time install process. There are two ways to set up Automatic Push: via a web interface or via an Enrollment Profile.

<h5>Web Interface</h5>

To install profiles using the web interface, you must direct users on your network to a certain page to add the profile to their device. The URL for this page is https://your-server-address/mydevices. After logging in, the user can just press the blue “Enroll” button to allow the device to be managed. Then, the user will go through the Manual Profile Install procedure for their device.

<h5>Enrollment Profiles</h5>

In order to save the user from the hassle of logging in and enrolling their device, you can configure their device to be managed through an Enrollment Profile. This is a special type of profile that configures a device to be managed. Just like any other profile, you can simply email this profile to a user, so they can install it on their device.

In order to create an Enrollment Profile, go to Profile Manager and click on the plus sign in the left column. Then, select “Enrollment Profile”. Give your profile a name. Enrollment Profiles only have one option: whether or not you want to restrict your profile to devices with placeholders. In order to download your enrollment profile, press the “Download” button in the lower-right corner.

Enrollment Profiles can be installed using the Manual Profile Install procedure.

<h6>Apple Configurator</h6>

Enrollment Profiles can also be installed using Apple’s free Configurator tool available in the Mac App Store. However, this method only works with iOS devices and requires a wipe of all data on the device, so this is only recommended for the initial setup of a new device.

<h4>Trust Profile</h4>

Profile Manager also creates one profile that you may want to have the user install before any other profiles: the Trust Profile. Every profile created with Profile Manager is signed with a digital certificate, but most of these are signed with a certificate from your server, so you need to configure your devices to recognize your server as a Certificate Authority. In order to do this, you will need to install your Trust Profile.

The Trust Profile can be installed via the My Devices web interface or by manual install. In the My Devices interface, have the user go to the Profiles tab and install the Trust Profile. To distribute your Trust Profile by other means, you can download it by clicking on your name in the top-right of Profile Manager.

<h2>Variables</h2>

Before you start creating profiles, there is one more component that you should know about: variables. Variables allow you to have custom information for each user, so that, for example, each user will have their own username for each mail account. Every variable for Profile Manager is contained in percentage signs (%). The available variables are:
<table>
<thead style="text-align: left;">
<tr>
<th>Variable</th>
<th>Description</th>
<th>Example</th>
<th>Data Source</th>
</tr>
</thead>
<tbody>
<tr>
<td>%first_name%</td>
<td>The first name of the user.</td>
<td>Jack</td>
<td>Open Directory</td>
</tr>
<tr>
<td>%last_name%</td>
<td>The last name of the user.</td>
<td>Harkness</td>
<td>Open Directory</td>
</tr>
<tr>
<td>%full_name%</td>
<td>The full name of the user.</td>
<td>Jack Harkness</td>
<td>Open Directory</td>
</tr>
<tr>
<td>%short_name%</td>
<td>The shortened name of the user. Typically used as a username.</td>
<td>jharkness</td>
<td>Open Directory</td>
</tr>
<tr>
<td>%job_title%</td>
<td>The job title of the user.</td>
<td>Captain</td>
<td>Open Directory</td>
</tr>
<tr>
<td>%email%</td>
<td>The email address of the user.</td>
<td>jharkness@example.com</td>
<td>Open Directory</td>
</tr>
<tr>
<td>%mobile_phone%</td>
<td>The mobile phone number of the user.</td>
<td>555-555-0123</td>
<td>Open Directory</td>
</tr>
<tr>
<td>%guid%</td>
<td>The system identification number of the user.</td>
<td>103</td>
<td>Open Directory</td>
</tr>
<tr>
<td>%ProductName%</td>
<td>The name of the device.</td>
<td>MacBook Air</td>
<td>Device Record (Profile Manager)</td>
</tr>
<tr>
<td>%SerialNumber%</td>
<td>The serial number of the device.</td>
<td>XYZ1234AB</td>
<td>Device Record (Profile Manager)</td>
</tr>
<tr>
<td>%OSVersion%</td>
<td>The version of the operating system on the device.</td>
<td>10.8.1</td>
<td>Device Record (Profile Manager)</td>
</tr>
<tr>
<td>%BuildVersion%</td>
<td>The build number of the operating system on the device.</td>
<td>31C96</td>
<td>Device Record (Profile Manager)</td>
</tr>
<tr>
<td>%WIFIMAC%</td>
<td>The MAC address of the Wi-Fi interface of the device.</td>
<td>01:23:45:67:89:ab</td>
<td>Device Record (Profile Manager)</td>
</tr>
<tr>
<td>%IMEI%</td>
<td>The IMEI number of the device. Typically only found on iPhones.</td>
<td>AA-BBBBBB-CCCCCC-D</td>
<td>Device Record (Profile Manager)</td>
</tr>
<tr>
<td>%ICCID%</td>
<td>The ICCID number of the device's SIM card.</td>
<td>1234 5678 9009 8765 432</td>
<td>Device Record (Profile Manager)</td>
</tr>
</tbody>
</table>

You can place the variables in almost any field in Profile Manager. Apple also offers special variables for configuring Ethernet on an enterprise network at <a href="http://help.apple.com/profilemanager/mac/2.1/#apd073333AA-30C6-4FD2-B2E0-E0C95658A2C4">http://help.apple.com/profilemanager/mac/2.1/#apd073333AA-30C6-4FD2-B2E0-E0C95658A2C4</a>.

Now, let’s get into the specific settings for your profiles, starting with settings for both OS X and iOS.

<h2>OS X and iOS</h2>

These settings in Profile Manager are functional for both Mac OS X and iOS. Some specific options may be platform specific. These cases will be noted below. Also, any settings that would only reasonably apply to one user (for example, Calendar or anything else with a login) can only be managed on a per user basis for OS X and iOS or on a per device basis for iOS (as iOS devices only have one running user).

<h3>General</h3>

<dl><dt>Profile Distribution Type</dt><dd>How the profile will be applied to devices. Profile Manager offers two choices: Automatic Push and Manual Download. Automatic Push will have the profile automatically applied to any managed devices that apply. Manual Download requires the user to login to Profile Manager to install the profile. The profile could also be distributed through a web page or an email message.</dd><dt>Organization</dt><dd>The name of your organization. Typically configured in the server settings and cannot be changed in Profile Manager.</dd><dt>Description</dt><dd>A description of the purpose of the profile. Displayed to the user if manually installed.</dd><dt>Security</dt><dd>Controls if the user can remove the profile. There are three possible options:
<ul>
	<li>Always: Can always be removed</li>
	<li>With authorization: Can be removed with a password set in Profile Manager</li>
	<li>Never: Requires an operating system reinstall on OS X or a device restore on iOS to remove the profile</li>
</ul>
</dd><dt>Automatically Remove Profile</dt><dd>If enabled, the profile will automatically remove itself when you set it to, either on a specific date or after a certain number of days</dd></dl>

<h3>Passcode</h3>

<dl><dt>Allow simple value</dt><dd>Allows the user to use a poor passcode. For example, 1234 or 1111.</dd><dt>Require alphanumeric value</dt><dd>Requires at least one letter in the password.</dd><dt>Minimum passcode length</dt><dd>Sets the minimum number of characters in a passcode</dd><dt>Minimum number of complex characters</dt><dd>Sets the minimum number of symbols in the passcode</dd><dt>Maximum passcode age</dt><dd>Sets the number of days before a user must change his/her passcode</dd><dt>Maximum Auto-Lock</dt><dd>Sets the time after which the phone automatically locks itself</dd><dt>Passcode history</dt><dd>Sets the number of different passcodes that must be used before one can be reused. iOS only feature.</dd><dt>Maximum grace period for device lock</dt><dd>The maximum amount of time after locking the device before a passcode is required to unlock the device. iOS only.</dd><dt>Maximum number of failed attempts</dt><dd>The maximum number of incorrect passcodes that can be entered in a row before the device’s data is erased</dd></dl>

<h3>Mail</h3>

These settings allow you to configure an IMAP or POP account on your device. SMTP is used for outgoing mail.

<dl><dt>Account Description</dt><dd>The name of the account. Appears in Settings on iOS, System Preferences on OS X, and in the Mail app.</dd><dt>Account Type</dt><dd>The protocol used to access the mail account. Options are POP (an older protocol) and IMAP (the current email protocol).</dd><dt>Display Name</dt><dd>The name of the user. Appears in the “From” field on outgoing email. I suggest using variables here.</dd><dt>Email Address</dt><dd>The address of the account. I suggest using variables here.</dd><dt>Allow messages to be moved</dt><dd>Allows messages from this account to be moved into another account. If unchecked, messages cannot leave folders within this account.</dd><dt>Allow recent addresses to be synced</dt><dd>Syncs the addresses that mail has been recently sent to.</dd><dt>Use Only in Mail</dt><dd>Only allows outgoing mail from official Mail app. Mail cannot be sent from any third party apps using this account.</dd><dt>Incoming and Outgoing Mail</dt><dd>Settings to access your mail server. If you leave the password blank, the user will be prompted for it. Variables are recommended for the “User Name” field.</dd></dl>If you use the plus (+) icon in the top right, you can add additional accounts and configure them using the same settings.

<h3>Exchange</h3>

Exchange settings are very similar to Mail settings. If you are using an Exchange server, you shouldn’t have an issue filling in the account information.

<h3>Contacts</h3>

The Contacts payload allows you to configure a CardDAV account. CardDAV is primarily used by OS X Server and iCloud, so you can typically use the automatic configuration option for this.

<dl><dt>Account Description</dt><dd>The name of the account. Appears in Settings on iOS, System Preferences on OS X, and in the Contacts app.</dd><dt>Account Hostname and Port</dt><dd>The address (either resolved DNS or IP address) for the CardDAV server. In the second box, input the port that the server is operating at. If you are unsure, it is probably the default, 8843.</dd><dt>Principal URL</dt><dd>A CardDAV option. If your server doesn’t provide this information, you can safely leave it blank.</dd><dt>Account Username</dt><dd>The username for the server account. You’ll probably want to use the username variable for this.</dd><dt>Account Password</dt><dd>The password for the server account. You’ll probably want to leave this blank and allow the user to enter his/her own password.</dd><dt>Use SSL</dt><dd>Enable a secure, encrypted connection to the CardDAV server. If your server supports this, I recommend enabling this to prevent eavesdropping on the connection.</dd></dl>If you use the plus (+) icon in the top right, you can add additional accounts and configure them using the same settings.

<h3>Calendar</h3>

The Calendar payload allows you to configure a CalDAV account.

<dl><dt>Account Description</dt><dd>The name of the account. Appears in Settings on iOS, System Preferences on OS X, and in the Contacts app.</dd><dt>Account Hostname and Port</dt><dd>The address (either resolved DNS or IP address) for the CalDAV server. In the second box, input the port that the server is operating at. If you are unsure, it is probably the default, 8843.</dd><dt>Principal URL</dt><dd>A CalDAV option. If your server doesn’t provide this information, you can safely leave it blank.</dd><dt>Account Username</dt><dd>The username for the server account. You’ll probably want to use the username variable for this.</dd><dt>Account Password</dt><dd>The password for the server account. You’ll probably want to leave this blank and allow the user to enter his/her own password.</dd><dt>Use SSL</dt><dd>Enable a secure, encrypted connection to the CalDAV server. If your server supports this, I recommend enabling this to prevent eavesdropping on the connection.</dd></dl>If you use the plus (+) icon in the top right, you can add additional accounts and configure them using the same settings.

<h3>Network</h3>

Allows you to configure the network connection on the device. Supports Wi-Fi and Ethernet connections only.

<dl><dt>Network Interface</dt><dd>The method of connecting to the network. Only two can be configured: Wi-Fi and Ethernet. Ethernet will only apply to OS X devices. Settings differ based on interface, so the following will be split based on the interface.</dd></dl>

<h4>Wi-Fi settings</h4>

<dl><dt>Service Set Identifier</dt><dd>Essentially, the name of the wireless network. Can be set in router settings.</dd><dt>Hidden Network</dt><dd>Your router may have the option to hide the SSID of your network from public view. Check this box if you have enabled this.</dd><dt>Auto Join</dt><dd>Check this box if you want the device to automatically connect to the wireless network if the network is in range</dd><dt>Proxy Setup</dt><dd>Some networks require a proxy to use the network. If you use a proxy, you may input the configuration information here. This setting has three choices:
<ul>
	<li>None (no proxy)</li>
	<li>Manual (manually enter proxy settings)</li>
	<li>Automatic (retrieve proxy settings from a URL)</li>
</ul>
</dd><dt>Security Type</dt><dd>The type of security that your network uses for authentication. Consult your network system for your network security type.</dd></dl>

<h4>Ethernet (available only for OS X)</h4>

<dl><dt>Network Security Settings</dt><dd>The authentication protocol for the network. If you are using an enterprise-class network, you must set up your router’s authentication system here.</dd></dl>

<h3>VPN</h3>

These settings configure a VPN on your Mac or iOS device. If you are using a VPN with OS X Server, we will cover these configuration settings in the VPN chapter. If you are using another VPN, you may simply enter your VPN configuration information in this payload.

<h3>Certificate</h3>

This payload allows you to add any encryption certificates to your device. This can be internal certificates, so you can encrypt your internal sites. Or, you could use certificates for any other form of encryption that you may need. Certificates can also be used in the Network settings to access an enterprise network. These settings will probably not be used in most instances. This payload has three settings:

<dl><dt>Certificate Name</dt><dd>A name of the certificate that will be displayed on the user’s device.</dd><dt>Certificate or Identity Data</dt><dd>The certificate file using the X.509 standard.</dd><dt>Passphrase</dt><dd>A passphrase that encrypts the contents of the certificate. The user will be required to enter this in order to install the profile.</dd></dl>

<h3>SCEP</h3>

Use these settings to access a SCEP server, if you have one. Most users will not be using this, so it is beyond the scope of this book.

<h3>Web Clips</h3>

A web clip is essentially a link that can be installed on a device’s home screen (on iOS) or Dock (on OS X). An unlimited number of these can be added to a user’s device. When managing a device, this option will be displayed under the iOS settings, as web clips can only be managed by user on OS X. Note that on OS X, the web clip will always open in the default browser.

<dl><dt>Label</dt><dd>The name of the web clip. Displayed beneath the app icon on iOS and on the OS X Dock.</dd><dt>URL</dt><dd>The web address that you want to be displayed.</dd><dt>Removable (iOS only)</dt><dd>Whether or not the web clip can be removed from the device. On OS X, the web clip can always be removed from the Dock.</dd><dt>Icon</dt><dd>The web clip’s icon. Will be displayed on both iOS and OS X.</dd><dt>Precomposed Icon (iOS only)</dt><dd>Removes the glossy effect applied to iOS icons. Visible in icon preview in Profile Manager.</dd><dt>Full Screen (iOS only)</dt><dd>Makes the web clip a standalone application. Otherwise, the web clip will simply open in Safari.</dd></dl>

<h3>Security and Privacy</h3>

This are some basic security settings for your users and devices.

<dl><dt>Send diagnostic and usage data to Apple</dt><dd>Controls whether or not your devices automatically send anonymous data to Apple to improve iOS and OS X.</dd><dt>Do not allow user to override Gatekeeper setting (OS X only)</dt><dd>Controls whether or not the user can override OS X’s Gatekeeper feature, which can restrict which types of applications can run on a system.</dd></dl>

<h2>Conclusion</h2>

That's it for the first part of the Profile Manager guide.

_Editor's note, 2014: I currently have no intention of expanding this guide.  If you are truly interested, get in touch with the contact link above._