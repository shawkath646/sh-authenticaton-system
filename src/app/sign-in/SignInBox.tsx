"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Countdown from "@/app/sign-in/Countdown";
import userSignIn from "@/actions/database/userSignIn";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import signInFormSchema from "@/Schema/signInFormSchema";
import { UserCredintialType, StatusType, TwoStepType } from "@/types/types";
import { CgSpinner } from "react-icons/cg";
import { FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import iconGoogle from "@/assets/icon_google.png";
import iconFacebook from "@/assets/icon_facebook.png";
import iconGithub from "@/assets/icon_github.svg";


interface UserCredintialExtendedType extends UserCredintialType {
    twoStepCode?: number;
}

export default function SignInBox() {

    const [isTwoStep, setTwoStep] = useState<TwoStepType>({
        isEnabled: false,
        expireOn: new Date()
    });
    const [isShowPassword, setShowPassword] = useState<boolean>(false);
    const [loginStatus, setLoginStatus] = useState<StatusType>({
        status: "initial",
        message: ""
    });

    const { register, formState: { errors, isSubmitting }, getValues, handleSubmit } = useForm<UserCredintialExtendedType>({
        resolver: yupResolver(signInFormSchema)
    });

    const onSubmit: SubmitHandler<UserCredintialExtendedType> = async (data) => {
        let response: StatusType;

        if (isTwoStep.isEnabled && (!data.twoStepCode || data.twoStepCode.toString().length !== 6)) {
            setLoginStatus({
                status: "error",
                message: "Invalid Verification code",
            });
            return;
        }

        response = await userSignIn("credentials", { username: data.username, password: data.password }, data.twoStepCode);
        if (response) {
            if ('twoStep' in response) setTwoStep(response.twoStep as TwoStepType);
            setLoginStatus({ status: response.status, message: response.message });
        }
    };

    const handleResend = async () => {
        const response = await userSignIn("credentials", { username: getValues("username"), password: getValues("password") });
        if ('twoStep' in response) setTwoStep(response.twoStep as TwoStepType);
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                    <label className="block text-sm mb-1">Username or email</label>
                    <input type="text" autoFocus={!isTwoStep} {...register("username")} disabled={isTwoStep.isEnabled} placeholder="Ex. michel92@random.com" aria-invalid={errors.username ? "true" : "false"} className="outline-none bg-transparent border-b block w-full border-gray-500 focus:border-blue-500 aria-invalid:focus:border-red-500 transition-all px-3 py-1 disabled:text-gray-500" />
                    <p className="h-5 text-red-500 text-xs">{errors.username?.message}</p>
                </div>

                <div className="relative">
                    <label className="block text-sm mb-1">Password</label>

                    <input type={(isShowPassword && !isTwoStep.isEnabled) ? "text" : "password"} {...register("password")} disabled={isTwoStep.isEnabled} placeholder="" aria-invalid={errors.password ? "true" : "false"} className="outline-none bg-transparent border-b block w-full border-gray-500 focus:border-blue-500 aria-invalid:focus:border-red-500 transition-all px-3 py-1 disabled:text-gray-500" />
                    <p className="h-5 text-red-500 text-xs">{errors.password?.message}</p>
                    <button type="button" className="absolute right-3 top-7 text-gray-400 hover:text-gray-700 transition-all" onClick={() => setShowPassword(previousValue => !previousValue)}>
                        {!isTwoStep.isEnabled && (isShowPassword ? <FaEye size={24} /> : <FaEyeSlash size={24} />)}
                    </button>
                </div>

                {isTwoStep.isEnabled && (
                    <div className="relative">
                        <label className="block text-sm mb-1">Verification Code</label>
                        <input type="number" {...register("twoStepCode")} autoFocus={isTwoStep.isEnabled} className="outline-none bg-transparent border-b block w-full border-gray-500 focus:border-blue-500 aria-invalid:focus:border-red-500 transition-all px-3 py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <div className="absolute right-0 bottom-1.5">
                            <Countdown handleResend={handleResend} time={isTwoStep.expireOn} />
                        </div>
                    </div>
                )}

                {!isTwoStep.isEnabled && (
                    <Link href="/password-reset" className="text-sm text-blue-500 hover:text-blue-600 transition-all">Forgot password?</Link>
                )}

                <p className="text-gray-500 text-xs">
                    <span>By logging in, you agree to our</span>&nbsp;
                    <Link href="/privacy-policy" className="text-xs text-blue-500 hover:text-blue-600 transition-all">Privacy Policy</Link>
                    <span>&nbsp;and&nbsp;</span>
                    <Link href="/terms-and-condition" className="text-xs text-blue-500 hover:text-blue-600 transition-all">Terms of Service</Link>
                    <span>, encompassing the responsible use of your data and adherence to platform guidelines.</span>
                </p>

                {loginStatus.message && (
                    <div className={`py-1.5 rounded bg-opacity-20 ${loginStatus.status !== "error" ? "bg-green-500" : "bg-red-500"}`}>
                        <p className={`px-3 flex items-center space-x-2 text-sm font-medium ${loginStatus.status !== "error" ? "text-green-500" : "text-red-500"}`}>
                            {loginStatus.status !== "error" ? (
                                <FaCheck size={16} />
                            ) : (
                                <RxCross1 size={16} />
                            )}
                            <span>{loginStatus.message}</span>
                        </p>
                    </div>
                )}
                <button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 hover:text-gray-300 transition-all w-full mx-auto disabled:bg-gray-500 py-1.5 rounded-md text-white dark:text-gray-200 flex items-center justify-center space-x-2">
                    {isSubmitting && <CgSpinner size={20} className="animate-spin" />}
                    <p>{isSubmitting ? "Please wait..." : (isTwoStep.isEnabled ? "Submit" : "Login")}</p>
                </button>
            </form>

            {!isTwoStep.isEnabled && (
                <>
                    <Link href="/sign-up" className="text-blue-500 block mt-4 text-center hover:text-blue-600 transition-all">New user? Create an account now</Link>

                    <div className="my-3 flex items-center space-x-3 px-6">
                        <hr className="h-px bg-gray-400 border-0 w-full" />
                        <p className="text-center text-gray-400">Or</p>
                        <hr className="h-px bg-gray-400 border-0 w-full" />
                    </div>

                    <div className="space-y-2">
                        <button type="button" onClick={async () => await userSignIn('google')} className="w-[350px] mx-auto border border-gray-900 dark:border-gray-400 hover:border-gray-500 dark:hover:bg-gray-800 dark:hover:border-gray-800 hover:bg-gray-100 transition-all rounded-md py-1 flex items-center justify-center space-x-2">
                            <Image src={iconGoogle.src} alt="google icon" height={16} width={16} className="h-[16px] w-[16px]" />
                            <p>Continue with Google</p>
                        </button>

                        <button type="button" disabled onClick={async () => await userSignIn('facebook')} className="w-[350px] mx-auto border border-gray-900 dark:border-gray-400 hover:border-gray-500 dark:hover:bg-gray-800 dark:hover:border-gray-800 hover:bg-gray-100 transition-all rounded-md py-1 flex items-center justify-center space-x-2 disabled:border-gray-300 disabled:text-gray-300 dark:disabled:border-gray-600 dark:disabled:text-gray-600">
                            <Image src={iconFacebook.src} alt="facebook icon" height={16} width={16} className="h-[16px] w-[16px]" />
                            <p>Continue with Facebook</p>
                        </button>

                        <button type="button" onClick={async () => await userSignIn('github')} className="w-[350px] mx-auto border border-gray-900 dark:border-gray-400 hover:border-gray-500 dark:hover:bg-gray-800 dark:hover:border-gray-800 hover:bg-gray-100 transition-all rounded-md py-1 flex items-center justify-center space-x-2">
                            <Image src={iconGithub.src} alt="github icon" height={16} width={16} className="h-[16px] w-[16px]" />
                            <p>Continue with GitHub</p>
                        </button>
                    </div>
                </>
            )}
        </>
    );
}