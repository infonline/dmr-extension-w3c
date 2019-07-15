<template>
  <v-app
    id="IMAREX"
    class="app"
  >
    <v-toolbar
      color="primary"
      dark
    >
      <img
        alt="logo"
        src="../../images/dmr38.png"
      >
      <v-toolbar-title class="white--text">
        Digital Market Research
      </v-toolbar-title>
      <v-spacer />
      <v-menu
        bottom
        left
      >
        <v-btn
          slot="activator"
          dark
          icon
        >
          <v-icon>menu</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile
            v-for="(item, index) in menuItems"
            :key="index"
            @click="() => navigateTo(item.path)"
          >
            <v-list-tile-avatar>
              <v-icon>
                {{ item.icon }}
              </v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ $t(`menuItems[${index}]`) }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-content>
      <router-view />
    </v-content>
    <v-footer
      class="footer"
    >
      <a
        href="https://www.infonline.de"
        target="_blank"
      >
        <span
          class="ml-3 body-1 grey--text darken-3"
          v-html="$t('copyright', { year: new Date().getFullYear() })"
        />
      </a>
    </v-footer>
  </v-app>
</template>
<script type="text/javascript" src="./App.js"></script>
<style scoped type="text/stylus" lang="stylus">
  .app
    height: 600px
    width: 432px
  .footer
    background-color: #fafafa
    a
      text-decoration: none !important
      color: inherit
</style>
