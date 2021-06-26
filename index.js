const driveUpload = require('./drive');
const Zip = require('adm-zip');
const config = require('./config.json');
const Cryptify = require('cryptify');
const schedule = require('node-schedule');
const execSync = require('child_process').execSync;

if (config.enabledHourlyUpload) {
    schedule.scheduleJob('1 * * * *', function () {
        if (config.limitHoursTo && config.limitHoursTo.length !== 0) {
            if (config.limitHoursTo.includes(new Date().getHours().toString())) backup();
        }else backup();
    })
}

driveUpload.setOptions({
    driveFolder: config.folderID,
    permissions: {}
});

async function backup() {
    return new Promise((async resolve => {
        for (const command of config.runCommandsBeforeExecution) {
            console.log(`Running ${command}`);
            try {
                await execSync(command)
            } catch (e) {
                console.warn(`Error executing ${command}`)
            }
            console.log(`Finished running ${command}`)
        }
        const zip = new Zip();
        console.log('Backing up...');
        const date = new Date();
        const filename = `backup-${config.prefix}-${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}-${date.getHours()}:${date.getMinutes()}.zip`;
        config.folders.forEach(f => {
            console.log(`Adding ${f.localFolder} to zip...`)
            zip.addLocalFolder(f.localFolder, f.zipFolder);
        });
        console.log(`Saving zip...`)
        zip.writeZip(`./tmp/${filename}`, async () => {
            console.log('Encrypting file..\n')
            await new Cryptify(`./tmp/${filename}`, config.key).encrypt();
            console.log('Encrypted successfully, uploading to GDrive...')
            driveUpload.store(`./tmp/${filename}`, `${filename}.crypt`, file => {
                console.log('Uploaded successfully');
                resolve(file);
            });
        });
    }));
}

if (config.backupOnStart) backup();