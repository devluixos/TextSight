<script>
  import { writable } from 'svelte/store';

  export let message = writable('');
  let visible = writable(false);

  $: if ($message) {
    visible.set(true);
    setTimeout(() => {
      visible.set(false);
      message.set('');
    }, 3000);
  }
</script>

{#if $visible}
  <div class="toast">
    <div class="toast-icon">⚠️</div> <!-- Add an icon here, can be changed to suit the message -->
    <div class="toast-message">{$message}</div>
  </div>
{/if}

<style lang="scss">
  .toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--interactive-accent);
    color: var(--text-on-accent);
    padding: 15px 25px;
    border-radius: 8px;
    opacity: 0.95;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: bold;
    animation: fadeIn 0.5s, fadeOut 0.5s 2.5s;
    z-index: 1000;
  }

  .toast-icon {
    font-size: 1.5em;
  }

  .toast-message {
    flex-grow: 1;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translate(-50%, 10px);
    }
    to {
      opacity: 0.95;
      transform: translate(-50%, 0);
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 0.95;
      transform: translate(-50%, 0);
    }
    to {
      opacity: 0;
      transform: translate(-50%, -10px);
    }
  }
</style>
