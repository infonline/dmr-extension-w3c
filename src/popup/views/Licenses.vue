<template>
  <v-container
    class="pa-2"
    fluid
    grid-list-md
  >
    <v-layout
      fluid
      row
      wrap
    >
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
              class="pl-3 mdi mdi-script-text"
            />
            <span class="subtitle-1 pl-3">
              {{ $t('headline') }}
            </span>
          </v-layout>
          <v-divider />
          <v-responsive
            max-height="381"
            style="overflow-y: scroll"
          >
            <v-layout
              class="ma-0"
              column
            >
              <div
                v-for="(license, index) in licenses"
                :key="index"
              >
                <v-list dense>
                  <v-list-item>
                    <v-list-item-content>
                      {{ $t('listItems.module') }}:
                    </v-list-item-content>
                    <v-list-item-content class="align-end">
                      {{ license.module }}
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      {{ $t('listItems.version') }}:
                    </v-list-item-content>
                    <v-list-item-content class="align-end">
                      {{ license.version }}
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      {{ $t('listItems.type') }}:
                    </v-list-item-content>
                    <v-list-item-content class="align-end">
                      {{ license.license }}
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      {{ $t('listItems.url') }}:
                    </v-list-item-content>
                    <v-list-item-content class="align-end">
                      <a @click="() => createTab(license.licenseUrl)">
                        <span>{{ $t('link') }}</span>
                      </a>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      {{ $t('listItems.repository') }}:
                    </v-list-item-content>
                    <v-list-item-content class="align-end">
                      <a @click="() => createTab(license.repository)">
                        <span>{{ $t('link') }}</span>
                      </a>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <v-divider v-if="index < licenses.length - 1" />
              </div>
            </v-layout>
          </v-responsive>
          <v-divider />
          <v-card-actions>
            <v-btn
              text
              color="primary"
              to="/"
            >
              {{ $t('buttons.back') }}
            </v-btn>
            <v-spacer />
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script type="text/javascript" src="./Licenses.js"></script>
