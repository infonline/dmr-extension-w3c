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
              class="pl-3 mdi mdi-information"
            />
            <span class="subtitle-1 pl-3">{{ $t('headline') }}</span>
          </v-layout>
          <v-divider />
          <v-responsive height="381">
            <v-list two-line>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('listItems.name.label') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    Digital Market Research by INFOnline
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('listItems.description.label') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ $t('listItems.description.text', { browser: browser.name }) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('listItems.version.label') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ version }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-divider />
            <v-list>
              <v-list-item
                ripple
                to="/licenses"
              >
                <v-list-item-avatar>
                  <v-icon class="mdi mdi-script-text" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('listItems.licenses.label') }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon class="mdi mdi-arrow-right" />
                </v-list-item-action>
              </v-list-item>
              <v-list-item
                ripple
                @click="() => createTab(links.privacy)"
              >
                <v-list-item-avatar>
                  <v-icon class="mdi mdi-security" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('listItems.privacy.label') }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon class="mdi mdi-arrow-right" />
                </v-list-item-action>
              </v-list-item>
              <v-list-item
                ripple
                @click="() => createTab(links.bugs)"
              >
                <v-list-item-avatar>
                  <v-icon class="mdi mdi-bug" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('listItems.bugs.label') }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon class="mdi mdi-arrow-right" />
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-responsive>
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
<script type="text/javascript" src="./About.js"></script>
