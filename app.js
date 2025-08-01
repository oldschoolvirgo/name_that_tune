
var trackInformationDiv = document.getElementById("trackInformationDiv");
var trackImage = document.getElementById("trackImage");
var trackDetails = document.getElementById("trackDetails");
var answerButton = document.getElementById("answerButton");
var audioButton = document.getElementById("audioButton");
var nextButton = document.getElementById("nextButton");
var audioPlayer = document.getElementById("audioPlayer");
var audioPlayerSource = document.getElementById("audioPlayerSource");
var selectDecade = document.getElementById("selectDecade");
var selectedDecade = document.querySelector('input[name="selectedDecade"]:checked');

//load defaults
window.addEventListener('load', function () {

    //update the audioControls button text
    if (!audioPlayer.paused) {
        audioButton.textContent = "Pause";
    } else {
        audioButton.textContent = "Play";
    }

    //load the first random track
    var dataURL = `https://raw.githubusercontent.com/oldschoolvirgo/name_that_tune/refs/heads/main/${selectedDecade.value}`;
    fetchRandomTrack(jsonFile = dataURL);
    
});


//selectDecade event listeners
selectDecade.addEventListener('click', function () {

    audioButton.setAttribute('style','opacity: 0.5;')
    audioButton.disabled = true;
    selectedDecade = document.querySelector('input[name="selectedDecade"]:checked');

});


//audioButton event listeners
audioButton.addEventListener('click', function () {

    if (!audioPlayer.paused) {
        audioPlayer.pause();
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

    var dataURL = `https://raw.githubusercontent.com/oldschoolvirgo/name_that_tune/refs/heads/main/${selectedDecade.value}`;
    fetchRandomTrack(jsonFile = dataURL); //get a random track
    
    audioButton.textContent = "Pause";
    audioButton.setAttribute('style', 'opacity: 1.0;')
    audioButton.disabled = false;
    
});


//get random track
async function fetchRandomTrack(jsonFile) {

    console.log(jsonFile);

    const trackDetailsDiv = document.getElementById('trackDetailsDiv');
    trackDetailsDiv.textContent = 'Loading track...'; // Show loading state

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
            return;
        }

        // Get a random index
        const randomIndex = Math.floor(Math.random() * data.length);

        // Get the random item from the array
        const randomItem = data[randomIndex];

        // Check if the item has a 'track' property
        if (!randomItem || !randomItem.track) {
            trackDetailsDiv.textContent = 'Selected item does not contain track data.';
            return;
        }

        const track = randomItem.track;

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

    } catch (error) {
        console.error('Error fetching or processing track data:', error);
        trackDetailsDiv.textContent = `Failed to load track data: ${error.message}`;
    }
}
