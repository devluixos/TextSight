<script>
    export let show = false;
    export let title = '';
    export let confirm;
  
    function closeModal() {
      show = false;
    }
  
    function handleConfirm() {
      confirm();
      closeModal();
    }
  </script>
  
  {#if show}
    <div class="modal-backdrop" on:click={closeModal}></div>
    <div class="modal">
      <div class="modal-header">
        <h2>{title}</h2>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div class="modal-footer">
      </div>
    </div>
  {/if}
  
  <style lang="scss">
    @import './Modal.scss';
  </style>
  