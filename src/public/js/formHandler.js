const urlModeBtn = document.getElementById("urlModeBtn");
const searchModeBtn = document.getElementById("searchModeBtn");
const urlInputMode = document.getElementById("urlInputMode");
const searchInputMode = document.getElementById("searchInputMode");

urlModeBtn.addEventListener("click", () => {
  urlModeBtn.classList.remove("bg-gray-300", "text-gray-700");
  urlModeBtn.classList.add("bg-green-600", "text-white");
  searchModeBtn.classList.remove("bg-green-600", "text-white");
  searchModeBtn.classList.add("bg-gray-300", "text-gray-700");
  urlInputMode.classList.remove("hidden");
  searchInputMode.classList.add("hidden");
});

searchModeBtn.addEventListener("click", () => {
  searchModeBtn.classList.remove("bg-gray-300", "text-gray-700");
  searchModeBtn.classList.add("bg-green-600", "text-white");
  urlModeBtn.classList.remove("bg-green-600", "text-white");
  urlModeBtn.classList.add("bg-gray-300", "text-gray-700");
  searchInputMode.classList.remove("hidden");
  urlInputMode.classList.add("hidden");
});

document.getElementById("rssForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const spotifyUrl = document.getElementById("spotify_url").value;
  const showId = extractShowId(spotifyUrl);

  if (!showId) {
    showError("Invalid Spotify URL. Please enter a valid Spotify show URL.");
    return;
  }

  await generateFeed(showId);
});

const searchInput = document.getElementById("search_query");
const searchResults = document.getElementById("search_results");
let searchTimeout = null;

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  if (!query) {
    searchResults.classList.add("hidden");
    searchResults.innerHTML = "";
    return;
  }

  searchTimeout = setTimeout(() => {
    searchPodcasts(query);
  }, 300);
});

document.addEventListener("click", (e) => {
  if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
    searchResults.classList.add("hidden");
  }
});

async function searchPodcasts(query) {
  try {
    const response = await fetch(
      `/api/search?query=${encodeURIComponent(query)}`,
    );
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to search podcasts");
    }

    displaySearchResults(data.shows);
  } catch (error) {
    console.error("Error searching podcasts:", error);
  }
}

function displaySearchResults(shows) {
  searchResults.innerHTML = "";

  if (!shows || shows.length === 0) {
    searchResults.innerHTML = `
      <div class="p-3 text-gray-500 text-center">No podcasts found</div>
    `;
    searchResults.classList.remove("hidden");
    return;
  }

  shows.forEach((show) => {
    const resultItem = document.createElement("div");
    resultItem.className =
      "p-3 hover:bg-gray-100 cursor-pointer flex items-center border-b";

    const imageUrl = show.image || "icon.png";

    resultItem.innerHTML = `
      <img src="${imageUrl}" alt="${show.name}" class="w-12 h-12 rounded mr-3">
      <div>
        <div class="font-semibold">${show.name}</div>
        <div class="text-xs text-gray-600">${show.publisher || ""}</div>
      </div>
    `;

    resultItem.addEventListener("click", () => {
      searchResults.classList.add("hidden");
      searchInput.value = show.name;
      generateFeed(show.id);
    });

    searchResults.appendChild(resultItem);
  });

  searchResults.classList.remove("hidden");
}

async function generateFeed(showId) {
  try {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `
      <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        <p>Generating RSS feed...</p>
      </div>
    `;

    await fetch("/api/feeds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ showId }),
    });

    resultDiv.innerHTML = `
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <p>RSS Feed generated successfully!</p>
        <p class="mt-2">
          <a href="/feed/${showId}" target="_blank" class="text-green-700 underline">
            View your feed page
          </a>
        </p>
      </div>
    `;
  } catch (error) {
    showError("Error generating feed. Please try again.");
    console.error(error);
  }
}

function extractShowId(url) {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");

    return pathParts[pathParts.length - 1];
  } catch {
    return null;
  }
}

function showError(message) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      ${message}
    </div>
  `;
}
