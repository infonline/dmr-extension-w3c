<template>
  <v-container
    class="pa-2"
    fluid
    grid-list-md
  >
    <v-layout fluid row wrap>
      <v-flex
        xs12
      >
        <v-card
          height="490"
        >
          <v-layout
            align-center
            class="ma-0 py-3"
          >
            <v-icon
              light
              class="pl-3"
            >assignment</v-icon>
            <span class="subheading pl-3">Licenses</span>
          </v-layout>
          <v-divider></v-divider>
          <v-responsive max-height="381" style="overflow-y: scroll">
            <v-layout class="ma-0" column>
              <div v-for="(license, index) in licenses" :key="index">
                <v-list dense>
                  <v-list-tile>
                    <v-list-tile-content>Module:</v-list-tile-content>
                    <v-list-tile-content class="align-end">{{ license.module }}</v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content>Version:</v-list-tile-content>
                    <v-list-tile-content class="align-end">{{ license.version }}</v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content>Type:</v-list-tile-content>
                    <v-list-tile-content class="align-end">{{ license.license }}</v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content>Url:</v-list-tile-content>
                    <v-list-tile-content class="align-end">
                      <a @click="() => createTab(license.licenseUrl)">
                        <span>click</span>
                      </a>
                    </v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content>Repository:</v-list-tile-content>
                    <v-list-tile-content class="align-end">
                      <a @click="() => createTab(license.repository)">
                        <span>click</span>
                      </a>
                    </v-list-tile-content>
                  </v-list-tile>
                </v-list>
                <v-divider v-if="index < licenses.length - 1"></v-divider>
              </div>
            </v-layout>
          </v-responsive>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn
              flat
              color="primary"
              to="/"
            >Back</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script type="text/javascript" src="./Licenses.js"></script>
