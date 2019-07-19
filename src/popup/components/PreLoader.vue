<template>
  <v-container
    class="pa-2"
    fluid
    fill-height
  >
    <v-layout
      align-center
      justify-center
      column
      fill-height
    >
      <v-card class="io-preloader-card elevation-0 grey lighten-5">
        <v-layout
          column
          align-center
          justify-center
        >
          <img
            class="io-dmr-logo mb-3"
            alt="dmr-shadowed"
            src="../../images/dmr-shadowed.svg"
          >
          <v-progress-linear
            height="2"
            color="primary"
            indeterminate
          />
        </v-layout>
      </v-card>
    </v-layout>
  </v-container>
</template>
<script type="text/javascript" src="./PreLoader.js"></script>
<style type="text/scss" lang="scss">
  .io-preloader-card {
    width: 128px;
    background-color: #fafafa;
  }
  .io-dmr-logo {
    width: 64px;
    height: 64px;
  }
</style>
