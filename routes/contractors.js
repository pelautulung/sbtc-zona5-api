const router = require('express').Router();
const { supabaseAdmin } = require('../lib/supabase');
const { requireAuth, requireRole, logAudit } = require('../middleware/auth');
router.use(requireAuth);
router.get('/', async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let q = req.db.from('contractors').select('*', { count: 'exact' }).order('company_name');
    if (status) q = q.eq('status', status);
    if (category) q = q.eq('category', category);
    if (search) q = q.ilike('company_name', `%${search}%`);
    const { data, error, count } = await q;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ data, total: count });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await req.db.from('contractors').select('*, personnel:personnel(id, full_name, position, is_active), applications:applications(id, application_number, status, created_at)').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', requireRole('superadmin','admin'), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('contractors').insert(req.body).select().single();
    if (error) return res.status(400).json({ error: error.message });
    await logAudit(req.userId, 'create', 'contractors', data.id, `Created: ${data.company_name}`, null, null, req);
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', requireRole('superadmin','admin'), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('contractors').update(req.body).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
