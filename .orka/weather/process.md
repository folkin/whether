# Orka Process Reference

This document orients any agent working on this project — Lead, Principal, or expert.

## Directory Layout

Your working directory is the outcome codebase at /home/human/code/personal/weather. This is where you read, write, and build code.

Project state — the ledger, artifacts, prototypes, agent personas, and config — lives at /home/human/code/personal/weather/.orka/weather/. These are separate from the outcome so that multiple Orka projects can target the same codebase.

## The Six Moves

Orka's design process has six moves. They're types of work, not a rigid sequence.

Discover — research the problem space, gather detail, build understanding.
Prototype — make the abstract tangible so decisions can be grounded in something concrete.
Decompose — break the problem into pieces that can be built and verified independently.
Define Acceptance — for each piece, define "done" in terms that can be checked.
Build — implement each piece against its acceptance criteria.
Integrate — combine pieces, verify the contracts between them hold.

## Artifacts

Design artifacts live in /home/human/code/personal/weather/.orka/weather/artifacts/ — research findings, the project brief, decomposition maps, contracts, acceptance criteria, micro-plans, and any other working documents. Prototypes live in /home/human/code/personal/weather/.orka/weather/prototypes/ — concrete, often throwaway things like wireframes, sample outputs, or rough drafts.

Both directories have a manifest.md that indexes their files. One line per file:

```
filename.md [sequence] - brief description of contents
```

The sequence number in brackets is the ledger entry of the cycle that last meaningfully touched the file. When you create a file, add a manifest line. When you edit one, update the sequence and description. When you delete one, remove its line.

## MCP Tools

Two MCP tools manage the phase lifecycle:

`orka_open` — open your phase. Pass your `role` and `cwd`. Returns `projectDir`, `outcomeDir`, and the project `name`. Call this at the start of your phase before doing any work.

`orka_complete` — signal that you've finished your phase. Pass your `checkpoint` (brief sentence for the ledger) and optionally `artifacts_updated`. This commits changes, writes a ledger entry, and signals the orchestrator. Commits happen automatically — the outcome directory is committed first, then the project directory with a cross-reference. Lead: make sure you've written `next-mission.md` before calling this. Principal: don't write `next-mission.md` — that's the Lead's job.

## Communication

Agents communicate across cycles through artifacts on disk. The ledger at /home/human/code/personal/weather/.orka/weather/ledger.log is a plain text log — one line per entry, newest first — tracking process history. The ledger is maintained automatically when you call orka_complete — never edit it directly. Anything important enough to survive to the next cycle needs to be in a file, not just in conversation.

The Lead decides what to do next. The Principal executes. Experts do focused work and return findings to the Principal.
