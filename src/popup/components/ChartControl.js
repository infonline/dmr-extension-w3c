export default {
  methods: {
    /**
     * Toggles the next item index. It works indeterminate. When max index is reached it will toggle the first item in collection
     */
    next() {
      const items = this.items.reverse();
      const len = items.length;
      const pos = items.findIndex(item => item.value === this.value);
      if (pos < len - 1) {
        this.toggle(items[pos + 1].value);
      } else {
        this.toggle(items[0].value);
      }
    },
    /**
     * Toggles the previous item index. It works indeterminate. When index 0 is reached it will toggle the last item in collection
     */
    previous() {
      const items = this.items.reverse();
      const len = items.length;
      const pos = items.findIndex(item => item.value === this.value);
      if (pos > 0) {
        this.toggle(items[pos - 1].value);
      } else {
        this.toggle(items[len - 1].value);
      }
    },
    /**
     * Toggles the current value and emits the change event
     * @param item
     */
    toggle(item) {
      this.$emit('change', item);
    },
    /**
     * Emits the reload event
     */
    reload() {
      this.$emit('reload');
    },
  },
  name: 'ChartControlComponent',
  props: {
    items: {
      type: Array,
      required: true,
      default: [],
    },
    label: {
      type: String,
      required: true,
      default: 'selection',
    },
    value: {
      type: String,
      required: true,
      default: 'select',
    },
  },
};
