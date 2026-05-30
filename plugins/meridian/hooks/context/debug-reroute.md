[Meridian debug reroute]

The user's last message reads as a terse failure signal ("still broken", "not fixed", "doesn't work") following a fix attempt. Per Meridian routing, this is a `debug` signal — NOT a cue to keep patching.

Stop the current patch loop. Do not propose another speculative fix from reasoning about the code. Invoke `meridian:debug` and complete Phase 1 root-cause investigation (read the code, reproduce, trace data flow) before changing anything. If you have already attempted 2+ fixes for this same symptom, say so plainly and treat the architecture or your assumptions as the suspect, not the next line of code.

Do not surface this reroute notice verbatim in your reply.
