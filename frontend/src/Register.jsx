import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast } from "sonner";

const formSchema = z.object({
  username: z.string().min(1, { message: "Username is Required" }),
  password: z.string().min(1, { message: "PRN is Required" }),
});

export default function Register() {
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const submit = async (data) => {
    try {
      const res = await axios.post("http://localhost:3000/register", data, {
        withCredentials: true,
      });
      console.log(res);
      
      toast.success(res.data.message);
      navigate("/game");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some Error Occured");
      console.log("Axios error", error.response.data);
    }
  };

  return (
    <div className="min-h-svh max-w-screen flex flex-col justify-center items-center">
      <Card className="w-md shadow-2xl text-center">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Register</CardTitle>
          <CardDescription>Enter your email below to Register</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(submit)}
              className="flex flex-col space-y-5"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ml-1">Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="test"
                        type="text"
                        autoComplete="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ml-1">Password</FormLabel>
                    <FormControl>
                      <Input placeholder="123" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="my-5">
                Sign Up
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
