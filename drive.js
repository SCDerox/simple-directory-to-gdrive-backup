/*
This file was "borrowed" from a module called drive-upload (https://www.npmjs.com/package/drive-upload) and modified a little bit, because it didn't work on my system
*/
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const FileType = require('file-type');

const SCOPES = ['https://www.googleapis.com/auth/drive'];

let options = {
    credentials: './credentials.json',
    token: './token.json',
    permissions: {
        'type': 'anyone',
        'role': 'reader'
    }
};

exports.setOptions = opts => {
    if (opts.driveFolder) {
        options['driveFolder'] = opts.driveFolder;
    }
    if (opts.permissions && Object.keys(opts.permissions).length > 0) {
        options['permissions'] = opts.permissions;
    }
};

exports.store = (srcFile, destFile, callback) => {
    fs.readFile(options.credentials, (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), auth => {
            FileType.fromFile(srcFile)
                .then(fileData => {
                    fileData = {ext: 'zip', mime: 'application/zip'};
                    const drive = google.drive({version: 'v3', auth});
                    const fileMetadata = {
                        'name': destFile ? destFile.split('/').pop() : srcFile.split('/').pop(),
                        parents: options.driveFolder ? [options.driveFolder] : null
                    };
                    const media = {
                        mimeType: fileData.mime,
                        body: fs.createReadStream(srcFile)
                    };
                    drive.files.create({
                        resource: fileMetadata,
                        media: media,
                        fields: 'id'
                    }, function (err, file) {
                        if (err) {
                            console.error(err);
                        } else {
                            drive.files.get({
                                fileId: file.data.id,
                                fields: 'id,name,mimeType,parents,webContentLink,webViewLink,thumbnailLink,createdTime,size,imageMediaMetadata'
                            }).then(response => {
                                response.data['webLink'] = response.data.webContentLink.replace('&export=download', '');
                                if (callback && typeof callback === 'function') {
                                    callback(response.data);
                                } else {
                                    console.log('fileData:', response.data);
                                }
                            }).catch(err => console.log('Drive error:', err));
                        }
                    });
                })
                .catch(err => {
                });
        });
    });
};

function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    fs.readFile(options.token, (err, token) => {
        if (err) {
            return getAccessToken(oAuth2Client, callback);
        }
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);

            fs.writeFile(options.token, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
            });
            callback(oAuth2Client);
        });
    });
}
