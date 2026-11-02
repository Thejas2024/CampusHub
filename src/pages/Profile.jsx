import React, { useState } from 'react'
import { Github, Linkedin, Mail, UserRound, Save } from 'lucide-react'
import SectionHeading from '../components/SectionHeading.jsx'

const PROFILE_STORAGE_KEY = 'campushub-profile'
const defaultProfile = {
	fullName: 'Thejas D S',
	email: 'student@example.com',
	degree: 'B.E. Computer Science',
	graduationYear: '2027',
	technicalSkills: 'React, JavaScript, Java, SQL',
	portfolioUrl: '',
}

const readProfile = () => {
	try {
		return { ...defaultProfile, ...JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}') }
	} catch {
		return defaultProfile
	}
}

export default function Profile() {
	const [profile, setProfile] = useState(readProfile)
	const [saved, setSaved] = useState(false)
	const [saveError, setSaveError] = useState('')

	const updateField = (field, value) => {
		setProfile((current) => ({ ...current, [field]: value }))
		setSaved(false)
		setSaveError('')
	}

	const handleSubmit = (event) => {
		event.preventDefault()

		try {
			const savedProfile = {
				...profile,
				fullName: profile.fullName.trim(),
				email: profile.email.trim(),
			}
			localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(savedProfile))
			setProfile(savedProfile)
			setSaved(true)
			setSaveError('')
		} catch {
			setSaved(false)
			setSaveError('Unable to save profile details in this browser.')
		}
	}

	const initials = profile.fullName
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0])
		.join('')

	return (
		<div className="inner-page">
			<SectionHeading
				eyebrow="YOUR STUDENT ACCOUNT"
				title="Student Profile"
				description="Keep your learning and career details up to date."
			/>
			<div className="profile-layout">
				<section className="white-panel profile-summary">
					<div className="profile-big-avatar">{initials}</div>
					<h3>{profile.fullName}</h3>
					<p>{profile.degree}</p>
					<span className="profile-tag">Student account</span>
					<div className="profile-links">
						<span><Mail size={14} /> {profile.email}</span>
						<span><Github size={14} /> {profile.technicalSkills || 'No skills added'}</span>
						<span><Linkedin size={14} /> {profile.portfolioUrl || 'No portfolio added'}</span>
					</div>
				</section>

				<section className="white-panel profile-form">
					<h3>Personal information</h3>
					<p>Update your details and save them to your student record.</p>
					<form onSubmit={handleSubmit}>
						<div className="profile-fields">
							<label>Full name<input required value={profile.fullName} onChange={(event) => updateField('fullName', event.target.value)} /></label>
							<label>Email address<input required type="email" value={profile.email} onChange={(event) => updateField('email', event.target.value)} /></label>
							<label>Degree<input value={profile.degree} onChange={(event) => updateField('degree', event.target.value)} /></label>
							<label>Graduation year<input value={profile.graduationYear} onChange={(event) => updateField('graduationYear', event.target.value)} /></label>
							<label>Technical skills<input value={profile.technicalSkills} onChange={(event) => updateField('technicalSkills', event.target.value)} /></label>
							<label>Portfolio URL<input type="url" value={profile.portfolioUrl} onChange={(event) => updateField('portfolioUrl', event.target.value)} placeholder="https://your-portfolio.example" /></label>
						</div>
						<button className="orange-small profile-save" type="submit"><Save size={14} /> Save changes</button>
						{saved && <span className="save-confirm" role="status">Profile saved successfully.</span>}
						{saveError && <span className="save-confirm" role="alert">{saveError}</span>}
					</form>
				</section>
			</div>
		</div>
	)
}
