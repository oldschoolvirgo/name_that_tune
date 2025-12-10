var trackInformationDiv = document.getElementById("trackInformationDiv");
var trackImage = document.getElementById("trackImage");
var trackDetails = document.getElementById("trackDetails");
var answerButton = document.getElementById("answerButton");
var audioButton = document.getElementById("audioButton");
var nextButton = document.getElementById("nextButton");
var audioPlayer = document.getElementById("audioPlayer");
var rewindSoundFX = document.getElementById("rewindSoundFX");
var audioPlayerSource = document.getElementById("audioPlayerSource");
var selectDecade = document.getElementById("selectDecade");
var selectedDecade = document.querySelector('input[name="selectedDecade"]:checked');

// --- NEW GLOBAL VARIABLES ---
// Array to store the IDs of tracks that have already been played in the current decade session
let playedTrackUris = []; 
// Variable to store the full array of tracks for the selected decade
let currentTrackList = []; 

//load defaults
window.addEventListener('load', function () {

    //update the audioControls button text
    if (!audioPlayer.paused) {
        audioButton.textContent = "Pause";
    } else {
        audioButton.textContent = "Play";
    }

    //load the first random track
    selectedDecade = document.querySelector('input[name="selectedDecade"]:checked');
    var dataURL = `https://raw.githubusercontent.com/oldschoolvirgo/name_that_tune/refs/heads/main/${selectedDecade.value}`;
    fetchTrackListAndRandomTrack(jsonFile = dataURL); 
});


//selectDecade event listeners
selectDecade.addEventListener('click', function () {

    audioButton.setAttribute('style','opacity: 0.5;')
    audioButton.disabled = true;
    selectedDecade = document.querySelector('input[name="selectedDecade"]:checked');
    
    // --- CLEAR PLAYED TRACKS AND FETCH NEW LIST WHEN DECADE CHANGES ---
    playedTrackUris = []; 
    var dataURL = `https://raw.githubusercontent.com/oldschoolvirgo/name_that_tune/refs/heads/main/${selectedDecade.value}`;
    fetchTrackListAndRandomTrack(jsonFile = dataURL); 

});


//audioButton event listeners
audioButton.addEventListener('click', function () {

    if (!audioPlayer.paused) {
        rewindSoundFX.play();
        audioPlayer.pause();
        Swal.fire({
            title: "15 Seconds starts now!!",
            text: "Guess the Song, Artist, and Lyrics",
            timer: 15000,
            timerProgressBar: true,
            // icon: "info",
            //target: document.getElementById('karaokeModeBackground')//
        }).then((result) => {
            /* Read more about handling dismissals below */
            if (result.dismiss === Swal.DismissReason.timer) {
                Swal.fire("Time is up!");
                //console.log("I was closed by the timer");
            }
        });
        audioButton.textContent = "Play";
    } else {
        audioPlayer.play();
        audioButton.textContent = "Pause";
    }

});


//answerButton event listeners
answerButton.addEventListener('click', function () {
    trackInformationDiv.setAttribute('style','visibility: visible;');
});


//nextButton event listeners
nextButton.addEventListener('click', function () {

    trackInformationDiv.setAttribute('style', 'visibility: hidden;');

    // --- CALL FUNCTION TO GET NEXT UNIQUE TRACK ---
    getRandomUniqueTrack(); 
    
    audioButton.textContent = "Pause";
    audioButton.setAttribute('style', 'opacity: 1.0;')
    audioButton.disabled = false;
    
});

// --- NEW FUNCTION TO FETCH THE ENTIRE TRACK LIST AND THEN GET THE FIRST RANDOM TRACK ---
async function fetchTrackListAndRandomTrack(jsonFile) {
    console.log(`Fetching track list from: ${jsonFile}`);

    const trackDetailsDiv = document.getElementById('trackDetailsDiv');
    trackDetailsDiv.textContent = 'Loading track list...'; // Show loading state

    try {
        // Fetch the JSON file
        const response = await fetch(jsonFile);

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON data
        const data = await response.json();

        // Ensure data is an array and not empty
        if (!Array.isArray(data) || data.length === 0) {
            trackDetailsDiv.textContent = 'No track data found or invalid format.';
            currentTrackList = []; // Reset list
            return;
        }

        currentTrackList = data; // Store the full list
        playedTrackUris = []; // Reset played list for new decade
        
        getRandomUniqueTrack(); // Get the first unique track
        
    } catch (error) {
        console.error('Error fetching track list:', error);
        trackDetailsDiv.textContent = `Failed to load track list: ${error.message}`;
        currentTrackList = []; // Reset list on error
    }
}


// --- REFACTORED FUNCTION TO GET A RANDOM UNIQUE TRACK ---
function getRandomUniqueTrack() {

    const trackDetailsDiv = document.getElementById('trackDetailsDiv');

    if (currentTrackList.length === 0) {
        trackDetailsDiv.textContent = 'Track list is empty. Cannot play a track.';
        return;
    }
    
    // Check if all tracks have been played
    if (playedTrackUris.length === currentTrackList.length) {
        trackDetailsDiv.textContent = 'All songs from this decade have been played! Change the decade to start fresh.';
        audioPlayer.pause();
        audioPlayer.src = ""; // Clear audio
        audioPlayer.load();
        return;
    }

    let randomItem;
    let randomIndex;
    let isTrackPlayed = true;

    // Loop until a track that has not been played is found
    while (isTrackPlayed) {
        randomIndex = Math.floor(Math.random() * currentTrackList.length);
        randomItem = currentTrackList[randomIndex];

        // Use the track's URI as a unique identifier
        const trackUri = randomItem.track ? randomItem.track.uri : null; 
        
        // Ensure track data exists and the track hasn't been played
        if (trackUri && !playedTrackUris.includes(trackUri)) {
            isTrackPlayed = false; // Found a unique track!
        } else if (!trackUri) {
            // Handle cases where a track item is invalid (no URI/track data) - skip it
            console.warn('Skipping invalid track item without URI:', randomItem);
        }
    }

    // --- Process the unique track details ---
    const track = randomItem.track;

    if (!track) {
        trackDetailsDiv.textContent = 'Selected item does not contain track data.';
        return;
    }

    // Add the unique track's URI to the played list
    playedTrackUris.push(track.uri);

    // Extract and display details
    const trackName = track.name || 'N/A';
    const artistNames = track.artists && track.artists.length > 0
        ? track.artists.map(artist => artist.name || 'N/A').join(', ')
        : 'N/A';
    const albumReleaseDate = track.album ? (track.album.release_date || 'N/A') : 'N/A';
    const date = new Date(albumReleaseDate);
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const albumReleaseDateFormatted = date.toLocaleDateString('en-US', dateOptions);

    trackDetailsDiv.innerHTML = `${trackName}<br>${artistNames}<br>${albumReleaseDateFormatted}`;
    
    const previewUrl = track.preview_url || 'N/A';
    //audioPlayer.pause();
    audioPlayer.load();
    audioPlayer.src = previewUrl;
    audioPlayer.load();

    let largestImageUrl = 'N/A';
    if (track.album && track.album.images && track.album.images.length > 0) {
        // Sort images by height/width descending to get the largest
        const sortedImages = [...track.album.images].sort((a, b) => (b.height || 0) - (a.height || 0));
        largestImageUrl = sortedImages[0].url || 'N/A';
    }

    trackImage.src = largestImageUrl;
    
    console.log(`Played tracks count: ${playedTrackUris.length}`);
}


// --- RENAMED AND MODIFIED ORIGINAL fetchRandomTrack to handle only fetching a unique track after the list is loaded ---
// Removed async/fetch logic from this function. It now only processes a track from the loaded list.
// The original function has been split into:
// 1. fetchTrackListAndRandomTrack (loads the list)
// 2. getRandomUniqueTrack (selects and plays the track)
// async function fetchRandomTrack(jsonFile) { ... } // NO LONGER USED
