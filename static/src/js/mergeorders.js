odoo.define('pos_merge_orders.floors', function (require) {
"use strict";

var screens = require('point_of_sale.screens');
var core = require('web.core');

var QWeb = core.qweb;
var _t = core._t;

var MergeOrdersButton = screens.ActionButtonWidget.extend({
    template: 'MergeOrdersButton',

    get_order_selection: function() {
            var order_selection = [];
            var table = this.pos.table;
            if(table == null){
                    throw new Error("Table is undefined.");
            }
            var orders = this.pos.get_table_orders(table);
            for(var i = 0; i < orders.length; i++){
                    var order = orders[i];

                    // Exclude current order
                    if(order == this.pos.get_order()) { continue; }

                    try {
                        var customer = order.get('client').name;
                    }
                    // Catch TypeError in case no client is set
                    catch(err) {
                        if(err.name == "TypeError") {
                            var customer = "";
                        }
                        else { throw new err; }
                    }

                    var date = moment(order.creation_date).format("hh:mm");
                    var label = order.sequence_number + ": " + customer + " (" + date + ")";
                    order_selection.push({ label: label, item: order });
            }
            return order_selection;
    },

    // Not extending order class for safety
    build_old_resume: function(order){
        var resume = {};
        order.orderlines.each(function(line){
            if (line.mp_skip || line.mp_dirty) {
                return;
            }
            var line_hash = line.get_line_diff_hash();
            var qty  = Number(line.get_quantity());
            var note = line.get_note();
            var product_id = line.get_product().id;

            if (typeof resume[line_hash] === 'undefined') {
                resume[line_hash] = {
                    qty: qty,
                    note: note,
                    product_id: product_id,
                    product_name_wrapped: line.generate_wrapped_product_name(),
                };
            } else {
                resume[line_hash].qty += qty;
            }
        });
        return resume;
    },

    // Not extending order class for safety
    add_to_resume: function(orderline, order) {
            var line_hash = orderline.get_line_diff_hash();
            var qty = Number(orderline.get_quantity());
            var note = orderline.get_note();
            var product_id = orderline.get_product().id;
            order.saved_resume[line_hash] = {
                qty: qty,
                note: note,
                product_id: product_id,
                product_name_wrapped: orderline.generate_wrapped_product_name(),
            };
    },

    merge_order: function(target_order) {
            var self = this;
            var current_order = this.pos.get_order();
            var orderlines = current_order.get_orderlines();
            this.pos.set_order(target_order);
            target_order.saved_resume = this.build_old_resume(target_order);
            for(var i = 0; i < orderlines.length; i++) {
                var orderline_clone = orderlines[i].clone();
                target_order.add_orderline(orderline_clone);
                if(!orderlines[i].mp_dirty) {
                    orderline_clone.set_dirty(false);
                    this.add_to_resume(orderline_clone, target_order);
                }
                if(!orderlines[i].mp_skip) {
                    orderline_clone.set_skip(false);
                }
            }

            // We need to switch back to the old order in order to delete it
            this.pos.set_order(current_order);
            this.pos.delete_current_order();

            this.pos.set_order(target_order);
    },

    button_click: function() {
            var self = this;
            this.gui.show_popup('selection',{
                title: _t("Merge order with"),
                list: this.get_order_selection(),
                confirm: function(order) { self.merge_order(order); },
            });
    },
});

screens.define_action_button({
        'name': 'merge',
        'widget': MergeOrdersButton,
        'condition': function() {
            return this.pos.config.is_order_merging;
        },
});

});
