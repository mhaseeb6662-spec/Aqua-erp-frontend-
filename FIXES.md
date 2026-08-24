# What was fixed in this update

See the backend's `FIXES.md` for the root cause explanation. On the
frontend side:

1. **`src/pages/Users.jsx`** and **`src/pages/crm/Leads.jsx`** — loading
   roles / the sales team no longer fails silently. If either request
   fails (e.g. a permissions error), you'll now see a toast explaining
   what went wrong instead of a form that just does nothing.
2. **`src/components/users/UserFormModal.jsx`** — shows a clear inline
   warning and disables "Create user" if there are no roles to choose
   from, instead of a `required` dropdown that silently blocks submission
   with no explanation.
3. **`src/components/crm/AssignLeadModal.jsx`** — same fix for lead
   assignment: a clear warning + disabled submit if there are no Sales
   Agent/Manager accounts yet, instead of silent failure.
4. Removed a stray, empty `src/{context,services,components...}` folder
   left over from a `mkdir -p src/{a,b,c}` command that was run somewhere
   without brace-expansion support (e.g. `cmd.exe` or `sh`). It contained
   no files and wasn't the cause of the reported issues, but it's dead
   clutter and was removed.
5. Removed the platform-specific `node_modules` from the zip (same reason
   as the backend — avoids shipping OS-specific native binaries). Run
   `npm install` after unzipping.

## To run this update

```bash
npm install
npm run dev      # or: npm run build && npm run preview
```

Set `VITE_API_URL` in a `.env` file if your backend isn't on
`http://localhost:5000/api/v1`.
