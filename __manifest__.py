# -*- coding: utf-8 -*-
{
    'name': "Merge POS orders",

    'summary': "Merge Point of Sale orders.",

    'description': """
        This module allows you to merge the orderlines of two Point of Sale orders.
    """,

    'author': "Dorina Kovacs",
    'support': "",
    'license': "LGPL-3",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/master/odoo/addons/base/module/module_data.xml
    # for the full list
    'category': 'Point Of Sale',
    'version': '0.3',

    'price': 5,
    'currency': 'EUR',

    'images': ['static/description/banner.png'],

    # any module necessary for this one to work correctly
    'depends': ['base', 'pos_restaurant'],

    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        'views/pos_merge_orders_templates.xml',
        'views/pos_config.xml',
    ],

    'qweb': [
        'static/src/xml/mergeorders.xml',
    ],
}
