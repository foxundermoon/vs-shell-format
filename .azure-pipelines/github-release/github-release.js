const octokit = require('@octokit/rest')({
    headers: {
        'user-agent': 'azure-pipelines/vscode-release-pipeline v1.0'
    }
});
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');

const DEBUG_LOGGING = process.env.SYSTEM_DEBUG && process.env.SYSTEM_DEBUG == 'true';
let vsixName = process.argv[2] || null;
let version = process.argv[3] || null;
let token = process.argv[4] || null
if (token === null) {
    console.log(`Usage:

    github-release.js <vsix> <version> <PAT>

This will create a new release and tag on GitHub at the current HEAD commit.

USE AT YOUR OWN RISK.
This is intended to be run by the release pipeline only.`);
    process.exit(1);
}

async function createRelease() {
    let target_commitish;
    if (process.env.BUILD_SOURCEBRANCH) {
        target_commitish = process.env.BUILD_SOURCEBRANCH;
    } else {
        const { stdout: head_commit } = await exec('git rev-parse --verify HEAD');
        target_commitish = head_commit.trim();
    }

    const { stdout: body } = await exec('cat minichangelog.txt');

    octokit.authenticate({
        type: 'token',
        token: token
    });

    console.log('Creating release...');
    let createReleaseResult;
    try {
        createReleaseResult = await octokit.repos.createRelease({
            owner: 'Microsoft',
            repo: 'azure-pipelines-vscode',
            tag_name: `v${version}`,
            target_commitish: target_commitish,
            name: `${version}`,
            body: body
        });
    } catch (e) {
        throw e;
    }
    console.log('Created release.');

    if (DEBUG_LOGGING) {
        console.log(createReleaseResult);
    }

    const vsixSize = fs.statSync(vsixName).size;

    console.log('Uploading VSIX...');
    let uploadResult;
    try {
        uploadResult = await octokit.repos.uploadAsset({
            url: createReleaseResult.data.upload_url,
            headers: {
                'content-length': vsixSize,
                'content-type': 'application/zip',
            },
            name: vsixName,
            file: fs.createReadStream(vsixName)
        });
    } catch (e) {
        throw e;
    }
    console.log('Uploaded VSIX.');

    if (DEBUG_LOGGING) {
        console.log(uploadResult);
    }
}

try {
    createRelease();
} catch (err) {
    console.error(err);
    process.exit(1);
}
