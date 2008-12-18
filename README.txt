INSTALLATION

1. Unpack module to your sites/all/modules directory
2. Enable "AJAX comments" module at Administer -> Site building -> Modules (admin/build/modules)
3. Optional: Make some changes to module configuration at
   Administer -> Site configuration -> AJAX comments (admin/settings/ajax_comments)

TROUBLESHOOTING

1. If you made all of those installation steps and comments are still not AJAXed, make sure that
"Location of comment submission form" option in comment settings of your module is set to
"Display below post or comments".

2. If you have themed your comments output, make sure that everything is wrapped to ".comment" class
in your "comment.tpl.php"


Created by Alexandr Shvets, aka neochief
http://drupaldance.com/