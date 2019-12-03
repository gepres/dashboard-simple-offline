<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout row wrap>
      <v-flex xs12>
        <material-card
          color="green"
          title="Agregar Producto"
          text="complete todo los campos"
        >
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
          >
            <div class="d-flex">
              <v-flex xs12 md4>
                <v-text-field
                  v-model="name"
                  :counter="10"
                  :rules="nameRules"
                  label="Nombre"
                  required
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field
                  v-model="price"
                  :rules="priceRules"
                  label="precio"
                  type="number"
                  required
                ></v-text-field>
              </v-flex>
            </div>
            
            <v-flex xs12 md12>
              <v-btn
                :disabled="!valid"
                color="success"
                @click="validate"
              >
                Agregar
              </v-btn>
            </v-flex>
          </v-form>
        </material-card>
      </v-flex>
      <!-- DATA TABLE - START -->
      <v-flex xs12>
      <v-toolbar flat color="white">
        <v-toolbar-title>Mi CRUD</v-toolbar-title>
        <v-divider
          class="mx-2"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="headline">Editar Producto</span>
            </v-card-title>

            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12 sm6 md4>
                    <v-text-field v-model="editedItem.name" label="Nombre"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md4>
                    <v-text-field v-model="editedItem.price" label="Precio"></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
              <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="products"
        class="elevation-1"
      >
        <template slot="items" slot-scope="{ item }">
          <td>{{item._id }}</td>
          <td class="text-xs-center">{{ item.name }}</td>
          <td class="text-xs-center">{{ item.price }}</td>
          <td class="justify-center layout px-0">
            <v-icon
              small
              class="mr-2"
              @click="editItem(item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              small
              @click="deleteItem(item)"
            >
              mdi-delete
            </v-icon>
          </td>
        </template>
      </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name:'producto',
  data() {
    return {
      valid: true,
      name: '',
      nameRules: [
        v => !!v || 'Nombre es requerido',
        v => (v && v.length <= 10) || 'Nombre tiene que ser menos de 10 caracteres'
      ],
      price: '',
      priceRules: [
        v => !!v || 'Precio es requerido'
      ],
      // data table
      dialog: false,
      headers: [
        {
          text: 'id',
          align: 'left',
          sortable: false,
          value: '_id'
        },
        { text: 'Nombre',  align: 'center',value: 'name' },
        { text: 'precio', align: 'center',value: 'price' },
        { text: 'Acción', align: 'center',value: 'name', sortable: false }
      ],
      products: [
      ],
      editedItem: {
        name: '',
        price: 0,
      },
      defaultItem: {
        name: '',
        price: 0,
      }
    }
  },
  created () {
      this.initialize()
    },
  watch: {
    dialog (val) {
      val || this.close()
    }
  },
  methods:{
    validate () {
      if (this.$refs.form.validate()) {
        this.snackbar = true
      }
    },
     initialize () {
        this.products = [
          {
            _id:1,
            name: 'Frozen Yogurt',
            price: 159,
          },
          {
            _id:2,
            name: 'Ice cream sandwich',
            price: 237
          },
          {
            _id:3,
            name: 'Eclair',
            price: 262
          }
        ]
     },
    editItem (item) {
      this.editedIndex = this.products.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem (item) {
      const index = this.desserts.indexOf(item)
    },
    close () {
      this.dialog = false
    },
    save () {

    }
  }
}
</script>

<style lang="scss" scoped>
</style>
