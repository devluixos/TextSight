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
    <div class="toast">{$message}</div>
  {/if}
  
  <style>
    .toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #333;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      opacity: 0.9;
    }
  </style>
  