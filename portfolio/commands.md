# Commands Reference

This file keeps useful commands for working on the personal portfolio project.

## Open The Project Folder

```powershell
cd "C:\Users\naiti\Documents\Road to Placement\portfolio"
```

Use this when you want the terminal to work inside the portfolio folder.

## Check Git Status

```powershell
git status
```

Use this to see which files are new, modified, or ready to commit.

## View Files In The Project

```powershell
Get-ChildItem
```

Use this to list the files and folders in the current directory.

## View Files Recursively

```powershell
Get-ChildItem -Recurse -File
```

Use this to see all files inside the project, including files inside `css`, `js`, and `assets`.

## Open The Website

Open this file in your browser:

```text
C:\Users\naiti\Documents\Road to Placement\portfolio\index.html
```

Because this is a simple HTML, CSS, and JavaScript project, it can run directly in the browser without a development server.

## First Git Commit Flow

```powershell
git status
git add portfolio
git commit -m "Build initial portfolio website"
```

Use this when you are ready to save the first version in Git.

## Good Commit Message Examples

```text
Add portfolio HTML structure
Style hero and skills sections
Add responsive navigation
Update project placeholders
Improve README documentation
```

Good commit messages explain what changed.

## Future Deployment Commands

Deployment commands will be added later when we choose a hosting option such as GitHub Pages, Netlify, or Vercel.
