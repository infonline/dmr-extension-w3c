<template>
  <v-app
    id="IMAREX"
    class="app"
  >
    <v-toolbar
      color="primary"
      dark
    >
      <img src="../../images/imarex38.png">
      <v-toolbar-title class="white--text">IMAREX</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu
        bottom
        left
      >
        <v-btn
          slot="activator"
          dark
          icon
        >
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile
            v-for="(item, index) in menuItems"
            :key="index"
            @click="() => navigateTo(item.path)"
          >
            <v-list-tile-avatar>
              <v-icon>{{item.icon}}</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{$t(`menuItems[${index}]`)}}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-content>
      <router-view></router-view>
    </v-content>
    <v-footer
      class="footer"
    >
      <a href="https://www.infonline.de" target="_blank">
        <span class="ml-3 body-1 grey--text darken-3">&copy INFOnline GmbH {{new Date().getFullYear()}}</span>
      </a>
    </v-footer>
  </v-app>
</template>
<script type="text/javascript" src="./App.js"></script>
<style scoped type="text/stylus" lang="stylus">
  .app
    height: 600px
    width: 400px
  .footer
    background-color: #fafafa
    a
      text-decoration: none !important
      color: inherit
</style>
