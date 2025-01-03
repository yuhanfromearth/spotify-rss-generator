document.getElementById("rssForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const spotifyUrl = document.getElementById("spotify_url").value;
  const showId = extractShowId(spotifyUrl);

  try {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";

    const button = e.target.querySelector("button");
    button.disabled = true;
    button.textContent = "Generating...";

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
    showError(error);
  } finally {
    const button = e.target.querySelector("button");
    button.disabled = false;
    button.textContent = "Generate RSS Feed";
  }
});

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
