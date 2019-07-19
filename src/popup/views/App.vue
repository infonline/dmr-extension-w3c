<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-app
    class="app"
    light
  >
    <v-app-bar
      app
      fixed
      title
      color="primary"
    >
      <img
        alt="logo"
        src="../../images/dmr-neutral32.svg"
        width="32"
        height="32"
      >
      <v-toolbar-title class="white--text ml-2">
        Digital Market Research
      </v-toolbar-title>
      <v-spacer />
      <v-menu
        bottom
        left
      >
        <template v-slot:activator="{ on }">
          <v-btn
            dark
            icon
            v-on="on"
          >
            <v-icon class="mdi mdi-menu" />
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in menuItems"
            :key="index"
            @click="() => navigateTo(item.path)"
          >
            <v-list-item-avatar>
              <v-icon
                class="mdi"
                :class="`mdi-${item.icon}`"
              />
            </v-list-item-avatar>
            <v-list-item-title>
              {{ $t(`menuItems[${index}]`) }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-content>
      <v-container
        class="pa-0"
        fluid
        fill-height
      >
        <v-pre-loader v-if="loading" />
        <router-view v-else />
      </v-container>
    </v-content>
    <v-footer
      app
      absolut
      class="footer"
    >
      <a
        href="https://www.infonline.de"
        target="_blank"
      >
        <span
          class="subtitle-2 grey--text darken-3"
          v-html="$t('copyright', { year: new Date().getFullYear() })"
        />
      </a>
    </v-footer>
  </v-app>
</template>
<script type="text/javascript" src="./App.js"></script>
<style scoped type="text/scss" lang="scss">
  .app {
    height: 600px;
    width: 432px;
  }
  .footer {
    background-color: #fafafa;
    a {
      text-decoration: none !important;
      color: inherit
    }
  }
</style>
