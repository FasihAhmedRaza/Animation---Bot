
// Function to handle sending query and receiving response
async function sendQueryToServer(queryText) {
    try {
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queryText }),
      });
  
      const data = await response.json();
      return data.response; // Return the response from the server
    } catch (error) {
      console.error('Error:', error);
      return "Something went wrong while communicating with the server.";
    }
  }

// Get the video element
const videoCharacter = document.getElementById('video-character');
let defaultVideoPath = 'defa.mp4'; // Path to the default video

// Function to smoothly transition between videos
function changeVideo(path) {
    // Fade out the current video
    videoCharacter.style.opacity = 0;
    
    setTimeout(() => {
        // Change the video source after the fade-out
        videoCharacter.src = path;
        videoCharacter.load();  // Reload the video
        videoCharacter.play();  // Play the new video
        
        // Fade in the new video after changing the source
        videoCharacter.style.opacity = 1;
    }, 300); // Adjust delay for a smoother transition (300ms)
}

// Load the default video on page load with looping enabled
window.onload = function() {
    videoCharacter.src = defaultVideoPath;
    videoCharacter.loop = true;  // Set the video to loop
    videoCharacter.play(); // Play the default video
    videoCharacter.style.opacity = 1; // Ensure video is visible
};

// Function to get available voices and select a female voice
let voices = [];

function getVoices() {
    voices = speechSynthesis.getVoices();
    return voices.find(voice => voice.name.toLowerCase().includes('female')) || voices[0]; // Fallback to first voice if no "female" voice found
}

// Function to simulate a chatbot response
async function chatbotReply(userMessage) {
    const chatOutput = document.getElementById('chat-output');
    chatOutput.innerHTML = ''; // Clear previous messages
  
    // Fetch response from the server
    const text = await sendQueryToServer(userMessage);
  
    const newMessage = document.createElement('div');
    newMessage.textContent = "😀 " + text;
    chatOutput.appendChild(newMessage);
  
    // Use speech synthesis for the chatbot's voice
    let utterance = new SpeechSynthesisUtterance(text);
  
    // Set voice to a female voice or adjust pitch/rate for effect
    const femaleVoice = getVoices();
    utterance.voice = femaleVoice;
    utterance.pitch = 1.2;  // Slightly higher pitch (range: 0 - 2)
    utterance.rate = 1.0;   // Normal speaking rate (range: 0.1 - 10)
  
    // Start the chatbot video when the chatbot starts speaking
    utterance.onstart = function() {
      changeVideo('video.mp4'); // Change to the chatbot interaction video
    };
  
    // Stop the chatbot video and switch back to the default video when speech ends
    utterance.onend = function() {
      changeVideo(defaultVideoPath); // Change back to the default video
    };
  
    speechSynthesis.speak(utterance);
  }
  
// Function to handle the user input and chatbot response
document.getElementById('send-button').addEventListener('click', async function() {
    const chatInput = document.getElementById('chat-input');
    const userMessage = chatInput.value;
  
    if (userMessage.trim() !== '') {
      // Clear previous chats
      const chatOutput = document.getElementById('chat-output');
      chatOutput.innerHTML = ''; // Clear chat history
  
      // Display user message
      const userDiv = document.createElement('div');
      userDiv.textContent = "👤 " + userMessage;
      chatOutput.appendChild(userDiv);
  
      // Clear input field
      chatInput.value = '';
  
      // Get chatbot reply
      await chatbotReply(userMessage);
    }
  });
  
  // Modified for Enter key trigger
  document.getElementById('chat-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      document.getElementById('send-button').click();
    }
  });

// Get microphone button and input field
const micButton = document.getElementById('mic-button');
const chatInput = document.getElementById('chat-input');

// Function to start speech recognition

// Ensure voices are loaded before using them
window.speechSynthesis.onvoiceschanged = getVoices;




let recognizing = false;
let recognition;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
        let transcript = event.results[event.resultIndex][0].transcript.trim();
        document.getElementById("chat-input").value = transcript;
        let message = transcript; // Captured message
        document.getElementById('chat-output').innerHTML += `<p>User: ${message}</p>`;
        
        // Simulate clicking the send button to handle chatbot response
        document.getElementById('send-button').click();
    };

    recognition.onerror = function(event) {
        console.log('Error occurred in recognition: ' + event.error);
    };

    recognition.onend = function() {
        recognizing = false;
        document.getElementById('micButton').textContent = 'Start Listening';
    };
}

function toggleMic() {
    if (recognizing) {
        recognition.stop();
        recognizing = false;
        document.getElementById('micButton').textContent = 'Start Listening';
    } else {
        recognition.start();
        recognizing = true;
        document.getElementById('micButton').textContent = 'Stop Listening';
    }
}