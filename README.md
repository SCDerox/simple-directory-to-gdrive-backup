# Simple directory to Google Drive Backup (SdtGDB) 
## Features
* This system will backup folders and upload them to Google Drive
* Every backup is encrypted using [cryptify](https://www.npmjs.com/package/cryptify)
* Backups can automatically done every hour

## Should I use this?
Probably not tbh. It's quite complicated to set up, and the project only hase a very small and specific use-case. 
`Why is it called "Simple.." if it's complicated to set up? ~ I am very glad you asked, it's because the code is quite simple and it took not a very long time to develop this "thing".`

## Installation
1. Clone this repo: `git clone https://github.com/SCDerox/simple-directory-to-gdrive-backup.git`
2. Install dependencies `npm ci`
3. Enabled the Google-Drive-API in your developer console, create and download the Oauth-Desktop-App-credentials and save them as `credentials.json` in the cloned directory.
4. Create a configuration-file called `config.json` in the cloned directory and change the configure parameters (explained below).
5. Then start the script as described below. The system should now ask you to follow a link and enter a token which goolge will issue you after finishing the authentication. Just follow the simple instructions in your console.  

## Start the system
* If you only want to back up once run `npm start` in the cloned directory
* To ensure that backups are performed hourly, I suggest to use [pm2](https://pm2.keymetrics.io/): `pm2 start index.js`

## Configure
You can change these parameters in the `config.json` you created earlier.
* `key`: Password with which the ZIP should be encrypted
* `prefix`: Optional prefix which should be put before every filenname
* `folderID`: Your google-drive-folder-ID
* `enabledHourlyUpload`: If enabled the script will backup your files hourly
* `limitHoursTo`: Array of strings; Hours to limit the hourly upload to
* `folders`: Array of the following objects:
    * `localFolder`: Path to your local folder to back up
    * `zipFolder`: Path to the backuped folder inside the ZIP

## How do I decrypt the encrypted file?
You can simply use the [cryptify](https://www.npmjs.com/package/cryptify) -cli and remove the `.crypt`-extension from the filename.

## Acknowledgements
The `drive.js` file is simply the module [drive-upload](https://www.npmjs.com/package/drive-upload), but I changed some things because it didn't always work on my system. 
