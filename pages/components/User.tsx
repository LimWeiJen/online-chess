import React, {useState, useEffect, useRef} from 'react'

const User = () => {
	const signUpUsername = useRef<any>(null);
	const signUpName = useRef<any>(null);
	const signUpPassword = useRef<any>(null);
	const [error, setError] = useState('');

	useEffect(() => {
		if (window.localStorage.getItem('token')) window.location.href = '/main'
	}, [])

	const signUp = async () => {
    // Check if all required fields are filled
		if (!signUpUsername.current!.value || !signUpPassword.current!.value || !signUpName.current!.value) {
			setError('missing required fields');
			return;
		}

		const res = await fetch('/api/user/sign-up', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				username: signUpUsername.current!.value,
				password: signUpPassword.current!.value,
				name: signUpName.current!.value
			})
		})

		if (res.ok) {
			const token = (await res.json())['token'];
			window.localStorage.setItem('token', `Bearer ${token}`);
			window.location.href = '/main'
		} else {
			setError('username was already taken, please try another one');
		}
	}


	const signIn = async () => {
    		// Check if all required fields are filled
		if (!signUpUsername.current!.value || !signUpPassword.current!.value) {
			setError('missing required fields');
			return;
		}

		const res = await fetch('/api/user/sign-in', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				username: signUpUsername.current!.value,
				password: signUpPassword.current!.value
			})
		})

		if (res.ok) {
			const token = (await res.json())['token'];
			window.localStorage.setItem('token', `Bearer ${token}`);
			window.location.href = '/main'
		} else {
			setError('incorrect username or password');
		}
	}

  return (
    <div>
      <input ref={signUpUsername} type='text' placeholder='username' />
      <input ref={signUpName} type='text' placeholder='name' />
      <input ref={signUpPassword} type='text' placeholder='password' />
      <button onClick={signIn}>Sign In</button>
      <button onClick={signUp}>Sign Up</button>
      <h1>{error}</h1>
    </div>
  )
}

export default User
