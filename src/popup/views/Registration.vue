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
              class="pl-3 mdi mdi-account-badge"
            />
            <span class="subtitle-1 pl-3 grey--text text--darken-2">
              Registration
            </span>
          </v-layout>
          <v-divider />
          <v-responsive height="381">
            <v-list
              two-line
            >
              <v-list-item>
                <v-list-item-avatar>
                  <v-icon class="mdi mdi-account-key" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('listItems.userId') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ registration.userId }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-avatar>
                  <v-icon class="mdi mdi-briefcase-account" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('listItems.provider') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ registration.provider ? registration.provider.label : $t('unknown') }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-avatar>
                  <v-icon class="mdi mdi-calendar" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('listItems.createdAt') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ $moment(registration.createdAt).fromNow() }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-avatar>
                  <v-icon class="mdi mdi-calendar" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('listItems.updatedAt') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ $moment(registration.updatedAt).fromNow() }}
                  </v-list-item-subtitle>
                </v-list-item-content>
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
            <v-btn
              color="error"
              dark
              @click="deregister()"
            >
              {{ $t('buttons.revoke') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script src="./Registration.js"></script>
