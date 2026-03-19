<script lang="ts">
	import { mdiConnection } from '@mdi/js';
	import { onMount } from 'svelte';
	import { SocketConnection } from '../socket';
	import {
		continuousReconnect$,
		isPaused$,
		openDialog$,
		reconnectSecondarySocket$,
		reconnectSocket$,
		secondarySocketState$,
		secondaryWebsocketUrl$,
		showConnectionErrors$,
		showConnectionIcon$,
		socketState$,
		websocketUrl$,
	} from '../stores/stores';
	import Icon from './Icon.svelte';

	export let isPrimary = true;

	let socketConnection: SocketConnection | undefined;
	let intitialAttemptDone = false;
	let wasConnected = false;
	let closeRequested = false;
	let socketState = isPrimary ? socketState$ : secondarySocketState$;

	$: connectedWithLabel = updateConnectedWithLabel(wasConnected);

	$: handleSocketState($socketState);

	onMount(() => {
		toggleSocket();

		return () => {
			closeRequested = true;
			socketConnection?.cleanUp();
		};
	});

	function handleSocketState(socketStateValue: number) {
		switch (socketStateValue) {
			case 0:
				wasConnected = false;
				closeRequested = false;
				break;
			case 1:
				intitialAttemptDone = true;
				wasConnected = true;
				break;
			case 3: {
				const socketType = isPrimary ? 'primary' : 'secondary';
				const socketUrl = isPrimary ? $websocketUrl$ : $secondaryWebsocketUrl$;

				if (
					$showConnectionErrors$ &&
					!closeRequested &&
					intitialAttemptDone &&
					socketUrl &&
					(wasConnected || !$continuousReconnect$)
				) {
					$openDialog$ = {
						type: 'error',
						message: wasConnected
							? `Lost Connection to ${socketType} Websocket`
							: `Unable to connect to ${socketType} Websocket`,
						showCancel: false,
					};
				}

				$isPaused$ = true;

				intitialAttemptDone = true;
				wasConnected = false;

				if (!closeRequested) {
					(isPrimary ? reconnectSocket$ : reconnectSecondarySocket$).next();
				}

				break;
			}

			default:
				break;
		}

		connectedWithLabel = updateConnectedWithLabel(wasConnected);
	}

	function updateConnectedWithLabel(hasConnection: boolean) {
		return hasConnection
			? `Connected with ${isPrimary ? $websocketUrl$ : $secondaryWebsocketUrl$}`
			: 'Not Connected';
	}

	async function toggleSocket() {
		if ($socketState === 1 && socketConnection) {
			closeRequested = true;
			socketConnection.disconnect();
		} else {
			socketConnection = socketConnection || new SocketConnection(isPrimary);
			socketConnection.connect();
		}
	}
</script>

{#if $socketState !== 0}
	<div
		class="socket-indicator hover:text-primary"
		class:socket-disconnected={$socketState !== 1}
		class:socket-connected={$socketState === 1}
		class:hidden={!$showConnectionIcon$}
		title={connectedWithLabel}
	>
		<Icon path={mdiConnection} class="cursor-pointer mx-2" on:click={toggleSocket} />
	</div>
{:else}
	<span
		class="relative inline-flex rounded-full h-2.5 w-2.5 mx-3 socket-ping"
		class:hidden={!$showConnectionIcon$}
		title="Connecting..."
	/>
{/if}

<style>
	.socket-indicator {
		transition: color 0.2s ease;
	}

	.socket-disconnected {
		color: var(--sm-red, #ed8796);
	}

	.socket-connected {
		color: var(--sm-green, #a6da95);
	}

	.socket-ping {
		background: var(--sm-accent, #8aadf4);
		animation: connect-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes connect-pulse {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.4; transform: scale(0.85); }
	}
</style>
