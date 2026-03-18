import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { departmentsApi, Department } from "@/api/departmentsApi";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

const Departments = () => {

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await departmentsApi.getDepartments();
      setDepartments(data);
    } catch {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingCode(null);
    setForm({ code: "", name: "" });
    setOpenDialog(true);
  };

  const openEditDialog = (dept: Department) => {
    setEditingCode(dept.code);
    setForm({
      code: dept.code,
      name: dept.name,
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {

      if (editingCode) {
        await departmentsApi.updateDepartment(editingCode, form);
        toast.success("Department updated");
      } else {
        await departmentsApi.createDepartment(form);
        toast.success("Department created");
      }

      setOpenDialog(false);
      fetchDepartments();

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (code: string) => {

    if (!confirm("Are you sure you want to delete this department?"))
      return;

    try {
      await departmentsApi.deleteDepartment(code);
      toast.success("Department deleted");
      fetchDepartments();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <DashboardLayout>

      <div className="space-y-6">

        <Card className="p-6">

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              Department Management
            </h2>

            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (

            <Table>

              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>

                {departments.length === 0 ? (

                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No departments found
                    </TableCell>
                  </TableRow>

                ) : (

                  departments.map((dept) => (

                    <TableRow key={dept.deptId}>

                      <TableCell>{dept.deptId}</TableCell>
                      <TableCell>{dept.code}</TableCell>
                      <TableCell>{dept.name}</TableCell>

                      <TableCell className="text-right space-x-2">

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(dept)}
                        >
                          <Pencil size={16} />
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(dept.code)}
                        >
                          <Trash2 size={16} />
                        </Button>

                      </TableCell>

                    </TableRow>

                  ))

                )}

              </TableBody>

            </Table>

          )}

        </Card>

      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>

        <DialogContent>

          <DialogHeader>
            <DialogTitle>
              {editingCode ? "Edit Department" : "Create Department"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">

            <Input
              placeholder="Department Code"
              value={form.code}
              disabled={editingCode !== null}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value })
              }
            />

            <Input
              placeholder="Department Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

          </div>

          <DialogFooter>

            <Button
              variant="outline"
              onClick={() => setOpenDialog(false)}
            >
              Cancel
            </Button>

            <Button onClick={handleSubmit}>
              {editingCode ? "Update" : "Create"}
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </DashboardLayout>
  );
};

export default Departments;