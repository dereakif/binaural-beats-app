<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { tracks, currentTrack } from '../lib/stores';
  import TrackEditor from '../lib/TrackEditor.svelte';
  import Player from '../lib/Player.svelte';

  let savedTracks = [];

  // Load saved tracks from local storage
  onMount(() => {
    const storedTracks = JSON.parse(localStorage.getItem('tracks') || '[]');
    tracks.set(storedTracks);
  });

  tracks.subscribe((value) => {
    savedTracks = value;
  });

  function saveTrack() {
    tracks.update((t) => {
      const updatedTracks = [...t, { ...$currentTrack }];
      localStorage.setItem('tracks', JSON.stringify(updatedTracks));
      return updatedTracks;
    });
  }

  function loadTrack(track) {
    currentTrack.set({ ...track });
  }

  function deleteTrack(index) {
    tracks.update((t) => {
      const updatedTracks = t.filter((_, i) => i !== index);
      localStorage.setItem('tracks', JSON.stringify(updatedTracks));
      return updatedTracks;
    });
  }
</script>

<h1>Binaural Beats Creator</h1>

<TrackEditor />
<Player />

<h2>Saved Tracks</h2>
<ul>
  {#each savedTracks as track, index}
    <li>
      {track.name}
      <button on:click="{() => loadTrack(track)}">Load</button>
      <button on:click="{() => deleteTrack(index)}">Delete</button>
    </li>
  {/each}
</ul>

<button on:click="{saveTrack}">Save Current Track</button>

<style>
  button {
    margin-right: 5px;
  }
</style>