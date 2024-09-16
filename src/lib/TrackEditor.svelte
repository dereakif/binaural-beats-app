<!-- src/lib/TrackEditor.svelte -->
<script>
	import { currentTrack } from './stores';

	function addSegment() {
		const segments = $currentTrack.segments;
		const lastSegment = segments[segments.length - 1];
		const startTime = lastSegment ? lastSegment.startTime + lastSegment.duration : 0;
		console.log(lastSegment, 'lastSegment');
		const { fromFreq, fromBinauralFreq, toFreq, toBinauralFreq, duration } = lastSegment;

		$currentTrack = {
			...$currentTrack,
			segments: [
				...segments,
				{
					type: 'fixed',
					startTime: startTime,
					duration: duration || 10,
					fromFreq: toFreq || fromFreq,
					toFreq: toFreq || fromFreq,
					fromBinauralFreq: toBinauralFreq || fromBinauralFreq,
					toBinauralFreq: toBinauralFreq || fromBinauralFreq
				}
			]
		};
	}

	function removeSegment(index) {
		const segments = $currentTrack.segments.filter((_, i) => i !== index);
		$currentTrack = { ...$currentTrack, segments };
		recalculateStartTimes();
	}

	function updateSegment(index, key, value) {
		const segments = $currentTrack.segments.map((segment, i) =>
			i === index ? { ...segment, [key]: value } : segment
		);
		$currentTrack = { ...$currentTrack, segments };
		if (key === 'duration') {
			recalculateStartTimes();
		}
	}

	function moveSegment(index, direction) {
		const segments = [...$currentTrack.segments];
		const newIndex = index + direction;

		if (newIndex < 0 || newIndex >= segments.length) return;

		[segments[index], segments[newIndex]] = [segments[newIndex], segments[index]];

		$currentTrack = { ...$currentTrack, segments };
		recalculateStartTimes();
	}

	function recalculateStartTimes() {
		let cumulativeTime = 0;
		const segments = $currentTrack.segments.map((segment) => {
			segment.startTime = cumulativeTime;
			cumulativeTime += parseFloat(segment.duration);
			return segment;
		});
		$currentTrack = { ...$currentTrack, segments };
	}
</script>

<h2>Track Editor</h2>
<input bind:value={$currentTrack.name} placeholder="Track Name" />

<table>
	<thead>
		<tr>
			<th>Type</th>
			<th>Start Time (s)</th>
			<th>Duration (s)</th>
			<th>From Freq (Hz)</th>
			<th>To Freq (Hz)</th>
			<th>From Binaural Freq (Hz)</th>
			<th>To Binaural Freq (Hz)</th>
			<th>Actions</th>
		</tr>
	</thead>
	<tbody>
		{#each $currentTrack.segments as segment, index}
			<tr>
				<td>
					<select
						bind:value={segment.type}
						on:change={() => updateSegment(index, 'type', segment.type)}
					>
						<option value="fixed">Fixed</option>
						<option value="transition">Transition</option>
					</select>
				</td>
				<td>{segment.startTime.toFixed(2)}</td>
				<td>
					<input
						type="number"
						min="0"
						bind:value={segment.duration}
						on:input={() => updateSegment(index, 'duration', segment.duration)}
					/>
				</td>
				<td>
					<input
						type="number"
						min="20"
						bind:value={segment.fromFreq}
						on:input={() => updateSegment(index, 'fromFreq', segment.fromFreq)}
					/>
				</td>
				<td>
					{#if segment.type === 'transition'}
						<input
							type="number"
							min="20"
							bind:value={segment.toFreq}
							on:input={() => updateSegment(index, 'toFreq', segment.toFreq)}
						/>
					{:else}
						N/A
					{/if}
				</td>
				<td>
					<input
						type="number"
						min="0"
						bind:value={segment.fromBinauralFreq}
						on:input={() => updateSegment(index, 'fromBinauralFreq', segment.fromBinauralFreq)}
					/>
				</td>
				<td>
					{#if segment.type === 'transition'}
						<input
							type="number"
							min="0"
							bind:value={segment.toBinauralFreq}
							on:input={() => updateSegment(index, 'toBinauralFreq', segment.toBinauralFreq)}
						/>
					{:else}
						N/A
					{/if}
				</td>
				<td>
					<button on:click={() => moveSegment(index, -1)} disabled={index === 0}>↑</button>
					<button
						on:click={() => moveSegment(index, 1)}
						disabled={index === $currentTrack.segments.length - 1}>↓</button
					>
					<button on:click={() => removeSegment(index)}>Remove</button>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<button on:click={addSegment}>Add Segment</button>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		padding: 8px;
		border: 1px solid #ccc;
	}
	input[type='number'] {
		width: 80px;
	}
	button {
		margin-right: 5px;
	}
</style>
