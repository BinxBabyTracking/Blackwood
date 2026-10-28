-- HALLOW001 is 1 to 6 investigators, like every other case.
update public.cases set
  min_investigators = 1,
  max_investigators = 6,
  summary = 'Antiquarian Edmund Blackthorn gathered twelve people connected to a Halloween party held at his estate twenty years earlier, the night a seventeen-year-old girl vanished and was written off as a runaway. He promised a revelation over dinner. Before he could make it, the power failed and he died behind a locked door. Several guests remember a woman in a black mourning veil. Others swear she was never there. Blackwood arrives at 10:32 PM, and whoever killed Edmund is still in the house, watching what you find. Work it alone or with up to five friends, against a killer who adapts to you.'
where id = 'HALLOW001';
