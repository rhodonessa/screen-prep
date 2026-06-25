"""Shared local judge for the screen assessment trainer.

Imported by engine/verify.py (the CLI the content agents run) and loaded
verbatim into Pyodide in the browser, so a solution that passes here passes
there. Keep this dependency-free (stdlib only) for Pyodide compatibility.
"""
import json
from collections import deque


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def make_namespace():
    """Globals every solution is exec'd into. ListNode/TreeNode are predefined
    so reference solutions can use them without redefining, same as LeetCode."""
    return {"ListNode": ListNode, "TreeNode": TreeNode}


# ---- converters -----------------------------------------------------------
def build_listnode(arr):
    head = None
    for v in reversed(arr or []):
        head = ListNode(v, head)
    return head


def dump_listnode(node, limit=100000):
    out, n = [], 0
    while node is not None and n < limit:
        out.append(node.val)
        node = node.next
        n += 1
    return out


def build_tree(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    q = deque([root])
    i, n = 1, len(arr)
    while q and i < n:
        node = q.popleft()
        if i < n:
            v = arr[i]; i += 1
            if v is not None:
                node.left = TreeNode(v); q.append(node.left)
        if i < n:
            v = arr[i]; i += 1
            if v is not None:
                node.right = TreeNode(v); q.append(node.right)
    return root


def dump_tree(root):
    if root is None:
        return []
    out, q = [], deque([root])
    while q:
        node = q.popleft()
        if node is None:
            out.append(None); continue
        out.append(node.val)
        q.append(node.left); q.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out


def convert_arg(value, kind):
    if kind == "listnode":
        return build_listnode(value)
    if kind == "tree":
        return build_tree(value)
    return value


def convert_ret(value, kind):
    if kind == "listnode":
        return dump_listnode(value)
    if kind == "tree":
        return dump_tree(value)
    return value


# ---- comparison -----------------------------------------------------------
def _key(x):
    return json.dumps(x, sort_keys=True, default=str)


def _deep_eq(a, b, tol=1e-6):
    if isinstance(a, bool) or isinstance(b, bool):
        return a is b or a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(a - b) <= tol
    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(_deep_eq(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_deep_eq(a[k], b[k], tol) for k in a)
    return a == b


def compare_vals(got, exp, mode="ordered"):
    """mode: ordered | unordered (top-level multiset) | unordered_deep (sort
    inner lists too, e.g. 3Sum / group anagrams)."""
    if mode == "unordered":
        if isinstance(got, list) and isinstance(exp, list):
            return sorted(map(_key, got)) == sorted(map(_key, exp))
        return _deep_eq(got, exp)
    if mode == "unordered_deep":
        def norm(v):
            if isinstance(v, list):
                rows = []
                for x in v:
                    rows.append(sorted(map(_key, x)) if isinstance(x, list) else _key(x))
                return sorted(json.dumps(r, default=str) for r in rows)
            return v
        return norm(got) == norm(exp)
    return _deep_eq(got, exp)


# ---- runners --------------------------------------------------------------
def _replay(cls, ops, args):
    obj, out, name = None, [], cls.__name__
    for op, a in zip(ops, args):
        if op == name:
            obj = cls(*a); out.append(None)
        else:
            out.append(getattr(obj, op)(*a))
    return out


def run_problem(spec, namespace):
    """Return a list of {pass, got, expected, args, error} for every test."""
    harness = spec.get("harness", "plain")
    results = []

    if harness == "custom":
        cls = namespace[spec["class_name"]]
        for t in spec["tests"]:
            try:
                got = _replay(cls, t["ops"], t["args"])
                results.append({"pass": compare_vals(got, t["expected"], "ordered"),
                                "got": got, "expected": t["expected"]})
            except Exception as e:
                results.append({"pass": False, "error": repr(e), "expected": t.get("expected")})
        return results

    fn = namespace[spec["entry"]]
    arg_types = spec.get("arg_types")
    ret_type = spec.get("ret_type", "plain")
    mode = spec.get("compare", "ordered")
    for t in spec["tests"]:
        args = t["args"]
        try:
            conv = [convert_arg(a, arg_types[i] if arg_types and i < len(arg_types) else "plain")
                    for i, a in enumerate(args)]
            got = convert_ret(fn(*conv), ret_type)
            results.append({"pass": compare_vals(got, t["expected"], mode),
                            "got": got, "expected": t["expected"], "args": args})
        except Exception as e:
            results.append({"pass": False, "error": repr(e), "args": args,
                            "expected": t.get("expected")})
    return results
