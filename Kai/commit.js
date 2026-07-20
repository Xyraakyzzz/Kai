const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readline = require("readline");
const {
    execSync
} = require("child_process");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (q) => new Promise(resolve => rl.question(q, resolve));

function run(cmd) {
    try {
        return execSync(cmd, {
            stdio: "inherit"
        });
    } catch (e) {
        console.log("Command error:", cmd);
    }
}

function randomName(len = 20) {
    return crypto.randomBytes(20)
        .toString("hex")
        .slice(0, len);
}

function parseRepo(url) {
    const clean = url
        .replace("https://github.com/", "")
        .replace("http://github.com/", "")
        .replace(".git", "")
        .replace(/\/$/, "");

    const parts = clean.split("/");

    return {
        username: parts[0],
        repo: parts[1]
    };
}

const templates = [{
        ext: "js",
        code: () => `console.log("${randomName()}");`
    },
    {
        ext: "py",
        code: () => `print("${randomName()}")`
    },
    {
        ext: "c",
        code: () => `#include <stdio.h>

int main(){
printf("${randomName()}");
return 0;
}`
    },
    {
        ext: "cpp",
        code: () => `#include <iostream>
using namespace std;

int main(){
cout<<"${randomName()}";
return 0;
}`
    },
    {
        ext: "dart",
        code: () => `void main(){
print("${randomName()}");
}`
    },
    {
        ext: "ts",
        code: () => `console.log("${randomName()}");`
    }
];


(async () => {

    const repoUrl = await ask("Repository URL: ");
    const name = await ask("Git name: ");
    const email = await ask("Git email: ");

    const repo = parseRepo(repoUrl);

    console.log("\nUsername:", repo.username);
    console.log("Repository:", repo.repo);


    run(`git config --global user.name "${name}"`);
    run(`git config --global user.email "${email}"`);


    if (!fs.existsSync(".git")) {
        run("git init");
    }


    run(`git remote remove origin`);
    run(`git remote add origin ${repoUrl}`);


    let count = 0;


    while (true) {

        const temp = templates[
            Math.floor(Math.random() * templates.length)
        ];

        const filename =
            `Temp-${randomName()}.${temp.ext}`;

        fs.writeFileSync(
            filename,
            temp.code()
        );


        console.log(
            "\nCreating:",
            filename
        );


        run("git add .");

        run(
            `git commit -m "Add ${filename}"`
        );


        run(
            "git branch -M master"
        );


        run(
            "git push origin master"
        );


        count++;

        console.log(
            "Commits:",
            count
        );


        await new Promise(
            r => setTimeout(r, 3000)
        );
    }


})();
