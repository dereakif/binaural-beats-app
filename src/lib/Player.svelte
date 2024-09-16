<!-- src/lib/Player.svelte -->
<script>
    import { currentTrack } from './stores';
  
    let isPlaying = false;
    let audioContext;
    let startTime;
  
    $: canPlay = $currentTrack.segments.length > 0;
  
    function play() {
      if (isPlaying || !canPlay) return;
  
      isPlaying = true;
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      startTime = audioContext.currentTime;
  
      $currentTrack.segments.forEach((segment) => {
        scheduleSegment(segment);
      });
    }
  
    function scheduleSegment(segment) {
      const { startTime: segStart, duration, type } = segment;
  
      const leftOscillator = audioContext.createOscillator();
      const rightOscillator = audioContext.createOscillator();
  
      // Left and Right Gain Nodes
      const leftGain = audioContext.createGain();
      const rightGain = audioContext.createGain();
  
      // Panning
      const leftPanner = audioContext.createStereoPanner();
      const rightPanner = audioContext.createStereoPanner();
      leftPanner.pan.value = -1;
      rightPanner.pan.value = 1;
  
      // Connect Oscillators
      leftOscillator.connect(leftGain).connect(leftPanner).connect(audioContext.destination);
      rightOscillator.connect(rightGain).connect(rightPanner).connect(audioContext.destination);
  
      leftGain.gain.value = 0.5;
      rightGain.gain.value = 0.5;
  
      const absoluteStartTime = startTime + segStart;
  
      if (type === 'fixed') {
        const { fromFreq, fromBinauralFreq } = segment;
  
        // Left Frequency
        leftOscillator.frequency.setValueAtTime(fromFreq - fromBinauralFreq / 2, absoluteStartTime);
  
        // Right Frequency
        rightOscillator.frequency.setValueAtTime(fromFreq + fromBinauralFreq / 2, absoluteStartTime);
      } else if (type === 'transition') {
        const { fromFreq, toFreq, fromBinauralFreq, toBinauralFreq } = segment;
        const endTime = absoluteStartTime + parseFloat(duration);
  
        // Left Frequency Transition
        leftOscillator.frequency.setValueAtTime(fromFreq - fromBinauralFreq / 2, absoluteStartTime);
        leftOscillator.frequency.linearRampToValueAtTime(toFreq - toBinauralFreq / 2, endTime);
  
        // Right Frequency Transition
        rightOscillator.frequency.setValueAtTime(fromFreq + fromBinauralFreq / 2, absoluteStartTime);
        rightOscillator.frequency.linearRampToValueAtTime(toFreq + toBinauralFreq / 2, endTime);
      }
  
      leftOscillator.start(absoluteStartTime);
      rightOscillator.start(absoluteStartTime);
  
      leftOscillator.stop(absoluteStartTime + parseFloat(duration));
      rightOscillator.stop(absoluteStartTime + parseFloat(duration));
    }
  
    function stop() {
      if (!isPlaying) return;
      audioContext.close();
      isPlaying = false;
    }
  </script>
  
  <h2>Player</h2>
  <button on:click="{play}" disabled="{!canPlay || isPlaying}">Play</button>
  <button on:click="{stop}" disabled="{!isPlaying}">Stop</button>
  
  <style>
    button {
      margin-right: 10px;
    }
  </style>