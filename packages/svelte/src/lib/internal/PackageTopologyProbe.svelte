<script lang="ts">
  type PackageTopologyProbeProps = {
    readonly label?: string;
  };

  let { label = "Astryx Svelte package" }: PackageTopologyProbeProps = $props();
</script>

<span data-astryx-package="svelte">{label}</span>
