// @ts-check
import { Octokit } from "octokit";
import { readFileSync, writeFileSync } from "fs";
import { Base64 } from "js-base64";

// This script generates an SVG from your GitHub language data.
// It is designed to be run as a GitHub Action with a GH_TOKEN secret.

// Function to fetch all user repos, including private and org repos
async function fetchAllUserRepos(octokit, username) {
  const allRepos = [];
  let hasNextPage = true;
  let page = 1;
  while (hasNextPage) {
    const repos = await octokit.rest.repos.listForAuthenticatedUser({
      type: "all",
      per_page: 100,
      page: page,
    });

    allRepos.push(...repos.data);
    if (repos.data.length < 100) {
      hasNextPage = false;
    }
    page++;
  }
  return allRepos;
}

// Main function to fetch data, process it, and generate the SVG
async function generateTopLangsSvg() {
  const token = process.env.GH_TOKEN;
  if (!token) {
    console.error("Error: GH_TOKEN environment variable is not set.");
    process.exit(1);
  }

  const octokit = new Octokit({
    auth: token
  });
  const {
    data: user
  } = await octokit.rest.users.getAuthenticated();
  console.log(`Authenticated as user: ${user.login}`);

  const repos = await fetchAllUserRepos(octokit, user.login);

  console.log(`Found ${repos.length} repositories.`);

  let languageCounts = {};
  let totalSize = 0;

  for (const repo of repos) {
    // Only count repos owned by the user or an organization they are a member of
    // and exclude forks
    if ((repo.owner.login === user.login || repo.owner.type === "Organization") && !repo.fork) {
      try {
        const languages = await octokit.rest.repos.listLanguages({
          owner: repo.owner.login,
          repo: repo.name,
        });

        for (const lang in languages.data) {
          if (languages.data.hasOwnProperty(lang)) {
            const size = languages.data[lang];
            languageCounts[lang] = (languageCounts[lang] || 0) + size;
            totalSize += size;
          }
        }
      } catch (e) {
        console.error(
          `Could not fetch languages for repo ${repo.name}: ${e.message}`
        );
      }
    }
  }

  if (Object.keys(languageCounts).length === 0) {
    console.log("No language data found.");
    process.exit(1);
  }

  // Sort languages by size and limit to the top 5
  const sortedLanguages = Object.keys(languageCounts)
    .sort((a, b) => languageCounts[b] - languageCounts[a])
    .slice(0, 5) 
    .map((lang) => ({
      name: lang,
      size: languageCounts[lang],
      percentage: (languageCounts[lang] / totalSize) * 100,
    }));

  const svgContent = generateSvg(sortedLanguages);

  // Write the SVG content to a file
  writeFileSync("top-langs.svg", svgContent, "utf-8");
  console.log("Successfully generated top-langs.svg");
}

// Function to generate the SVG string with the requested aesthetics
function generateSvg(languages) {
  const title = "Top Languages";
  const cardWidth = 495;
  const paddingX = 25;
  const paddingY = 25;
  const titleBarHeight = 80;
  const barHeight = 12;
  const legendSpacingY = 25;
  const radius = 10;

  const cardHeight = titleBarHeight + (languages.length * legendSpacingY) + paddingY;

  const barColors = [
    "#8be9fd", // Light blue
    "#ff79c6", // Pink
    "#ffb86c", // Orange
    "#50fa7b", // Green
    "#bd93f9", // Purple
    "#f1fa8c", // Yellow
    "#ff5555", // Red
    "#6272a4", // Desaturated blue
    "#ff9ff3", // Light pink
    "#8be9fd80", // Transparent light blue (for contrast)
  ];

  let svgBars = '';
  let yOffset = titleBarHeight;

  languages.forEach((lang, i) => {
    const barLength = (lang.percentage / 100) * (cardWidth - (2 * paddingX) - 130);
    const color = barColors[i % barColors.length];
    
    // Language name
    svgBars += `<text x="${paddingX}" y="${yOffset + 15}" font-family="Segoe UI,Tahoma,Geneva,Verdana,sans-serif" font-size="14" fill="#C3D1D9">${lang.name}</text>`;
    
    // Bar
    svgBars += `<rect x="${paddingX + 130}" y="${yOffset + 5}" width="${barLength}" height="${barHeight}" fill="${color}" rx="6" ry="6" />`;
    
    // Percentage text
    svgBars += `<text x="${paddingX + 130 + barLength + 10}" y="${yOffset + 15}" font-family="Segoe UI,Tahoma,Geneva,Verdana,sans-serif" font-size="14" fill="#C3D1D9">${lang.percentage.toFixed(2)}%</text>`;

    yOffset += legendSpacingY;
  });
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}">
    <rect width="${cardWidth}" height="${cardHeight}" fill="#0D1117" rx="${radius}" ry="${radius}" />
    <text x="${paddingX}" y="${paddingY + 20}" font-family="Segoe UI,Tahoma,Geneva,Verdana,sans-serif" font-size="20" font-weight="bold" fill="#58A6FF">${title}</text>
    <g>
      ${svgBars}
    </g>
  </svg>`;
}

generateTopLangsSvg().catch(console.error);
