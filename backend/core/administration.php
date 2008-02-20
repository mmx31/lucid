<?php
/*
    Psych Desktop
    Copyright (C) 2006 Psychiccyberfreak

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; version 2 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
	*/
	require("../lib/includes.php");
	import("models.user");
	if($_SESSION['userlevel'] == "admin")
	{
		if($_GET['section'] == "general")
		{
			if($_GET['action'] == "diskspace")
			{
				if(is_dir("/"))
				{
					$free = disk_free_space("/");
					$total = disk_total_space("/");
				}
				else
				{
					//windowze?
					$free = disk_free_space("C:");
					$total = disk_total_space("C:");
				}
				$p = new jsonOutput();
				$free = str_replace(",", ".", strval($free));
				$total = str_replace(",", ".", strval($total));
				$p->append("free", $free);
				$p->append("total", $total);
			}
		}
		if($_GET['section'] == "users")
		{
			if($_GET['action'] == "list")
			{
				$p = $User->all();
				$pl = count($p)-1;
				echo "[";
				foreach($p as $d => $v)
				{
					echo $v->make_json();
					if($d < $pl) { echo ",\n"; }
				}
				echo "]";
			}
			if($_GET['action'] == "online")
			{
				$online = 0;
				$total = 0;
				$p = $User->all();
				foreach($p as $u)
				{
					$total++;
					if($u->logged == 1) $online++;
				}
				$o = new jsonOutput;
				$o->append("online", $online);
				$o->append("total", $total);
			}
		}
	}
?>