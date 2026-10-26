-- Every case plays solo or with up to five friends: 1 to 6 investigators.
-- (A strictly multiplayer case, built later, will be 4 to 10.)
update public.cases set min_investigators = 1, max_investigators = 6;
