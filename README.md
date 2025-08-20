## GitHub Stats Generator
This repository is a self-contained automation that generates a dynamic SVG image for a GitHub profile.

![Top Languages](https://github.com/jshujshu/github-stats-generator/raw/main/top-langs.svg)

### How It Works
1. **Trigger:** A GitHub Actions workflow (`.github/workflows/generate-stats.yml`) is set to run automatically every 24 hours. It can also be triggered manually.

2. **Execution:** The workflow runs a Node.js script (`top-langs-generator.mjs`) in a virtual environment.

3. **Data Fetching:** The script uses your GitHub Personal Access Token (stored securely as a repository secret) and the Octokit library to make API calls. It fetches a list of all repositories you have access to, including private and organization-owned ones.

4. **Processing:** The script processes the repository data to calculate the top 5 most-used languages, excluding forks.

5. **Image Generation:** The script then generates an SVG image based on this processed data, with a layout and theme matching the GitHub Dark theme.

6. **Output:** The generated SVG file (`top-langs.svg`) is committed back to the repository, replacing the old file.

This process ensures the stats card on your profile is always up-to-date without any manual intervention. 
