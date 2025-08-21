## GitHub Stats Generator
This repo is a self-contained automation that generates a dynamic stat card for a GitHub profile.

![Top Languages](https://github.com/jshujshu/github-stats-generator/raw/main/top-langs.svg)

### How It Works
1. **Trigger:** A GitHub Actions workflow (`.github/workflows/generate-stats.yml`) automatically runs every 24 hours. It can also be triggered manually.

2. **Execution:** The workflow runs a Node.js script (`top-langs-generator.mjs`) in a virtual environment.

3. **Data Fetching:** The script uses the user's GitHub Personal Access Token (stored securely as a repo secret) and the Octokit library to make API calls. It fetches a list of all repositories the user has access to, including private and organization-owned ones. This allows a more complete view of a user's languages than other similar tools.  

4. **Processing:** The script processes the user's repo data to calculate their top 5 most-used languages, excluding forks.

5. **Image Generation:** The script then generates an SVG image that displays the user's top 5 most used languages. The theme matches Github's dark theme. 

6. **Output:** The generated SVG (`top-langs.svg`) is committed to the repo, replacing the old file.

This process ensures the stats card on your profile is always up-to-date without any manual intervention. 
