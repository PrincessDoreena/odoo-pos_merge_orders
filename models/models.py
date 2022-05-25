# -*- coding: utf-8 -*-

from odoo import models, fields, api

class PosConfig(models.Model):
    _inherit = 'pos.config'

    is_order_merging = fields.Boolean(string='Order Merging', help='Allow merging orders', default=True)
